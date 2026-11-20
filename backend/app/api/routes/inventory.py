import io
import csv
import hashlib
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.inventory import Product, ProductCategory, InventoryItem, InventoryBatch, InventoryTransaction, StockTransfer
from app.models.warehouse import Warehouse
from app.models.user import User
from app.schemas.inventory import (
    ProductCreate, ProductUpdate, ProductOut, InventoryItemOut,
    ReceiveStockRequest, DispatchStockRequest, TransferStockRequest,
    TransferOut, InventoryTransactionOut
)
from app.core.permissions import get_current_user

router = APIRouter(prefix="/inventory", tags=["Smart Inventory Management"])

@router.get("", response_model=List[InventoryItemOut])
@router.get("/items", response_model=List[InventoryItemOut])
def get_inventory_items(
    warehouse_id: Optional[int] = None,
    category_id: Optional[int] = None,
    low_stock_only: bool = False,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(InventoryItem).join(Product).join(Warehouse).join(ProductCategory)
    
    if warehouse_id:
        query = query.filter(InventoryItem.warehouse_id == warehouse_id)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if low_stock_only:
        query = query.filter(InventoryItem.quantity_on_hand <= Product.reorder_threshold)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_filter)) |
            (Product.sku.ilike(search_filter)) |
            (Warehouse.name.ilike(search_filter))
        )
        
    items = query.all()
    
    result = []
    for item in items:
        batches_out = [
            {
                "id": b.id,
                "batch_number": b.batch_number,
                "initial_quantity": b.initial_quantity,
                "current_quantity": b.current_quantity,
                "manufacture_date": b.manufacture_date,
                "expiry_date": b.expiry_date,
                "dynamic_remaining_shelf_life_days": b.dynamic_remaining_shelf_life_days,
                "quality_status": b.quality_status,
                "smart_drum_fill_pct": b.smart_drum_fill_pct
            }
            for b in item.batches
        ]
        
        result.append({
            "id": item.id,
            "warehouse_id": item.warehouse_id,
            "warehouse_name": item.warehouse.name,
            "product_id": item.product_id,
            "product_name": item.product.name,
            "sku": item.product.sku,
            "category_name": item.product.category.name if item.product.category else "General Defense Supply",
            "quantity_on_hand": item.quantity_on_hand,
            "quantity_reserved": item.quantity_reserved,
            "quantity_in_transit": item.quantity_in_transit,
            "isolation_adjusted_dos": item.isolation_adjusted_dos,
            "stock_truth_score": item.stock_truth_score,
            "spoilage_risk_index": item.spoilage_risk_index,
            "batches": batches_out,
            "updated_at": item.updated_at
        })
    return result

@router.get("/products", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    out = []
    for p in products:
        total_qty = db.query(func.sum(InventoryItem.quantity_on_hand)).filter(InventoryItem.product_id == p.id).scalar() or 0.0
        out.append({
            "id": p.id,
            "sku": p.sku,
            "name": p.name,
            "category_id": p.category_id,
            "category_name": p.category.name if p.category else "General",
            "unit_of_measure": p.unit_of_measure,
            "weight_kg_per_unit": p.weight_kg_per_unit,
            "volume_m3_per_unit": p.volume_m3_per_unit,
            "min_safe_temp_c": p.min_safe_temp_c,
            "max_safe_temp_c": p.max_safe_temp_c,
            "max_safe_humidity_pct": p.max_safe_humidity_pct,
            "nominal_shelf_life_days": p.nominal_shelf_life_days,
            "reorder_threshold": p.reorder_threshold,
            "emergency_buffer_min": p.emergency_buffer_min,
            "unit_cost_inr": p.unit_cost_inr,
            "total_quantity_on_hand": total_qty,
            "created_at": p.created_at
        })
    return out

@router.post("", response_model=ProductOut)
@router.post("/products", response_model=ProductOut)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.sku == payload.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Product SKU {payload.sku} already exists.")
        
    product = Product(**payload.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    
    # Auto-initialize inventory records across warehouses with 0 quantity
    warehouses = db.query(Warehouse).all()
    for wh in warehouses:
        inv = InventoryItem(
            warehouse_id=wh.id,
            product_id=product.id,
            quantity_on_hand=0.0
        )
        db.add(inv)
    db.commit()
    
    return {
        "id": product.id,
        "sku": product.sku,
        "name": product.name,
        "category_id": product.category_id,
        "category_name": product.category.name if product.category else "General",
        "unit_of_measure": product.unit_of_measure,
        "weight_kg_per_unit": product.weight_kg_per_unit,
        "volume_m3_per_unit": product.volume_m3_per_unit,
        "min_safe_temp_c": product.min_safe_temp_c,
        "max_safe_temp_c": product.max_safe_temp_c,
        "max_safe_humidity_pct": product.max_safe_humidity_pct,
        "nominal_shelf_life_days": product.nominal_shelf_life_days,
        "reorder_threshold": product.reorder_threshold,
        "emergency_buffer_min": product.emergency_buffer_min,
        "unit_cost_inr": product.unit_cost_inr,
        "created_at": product.created_at,
        "total_quantity_on_hand": 0.0
    }

@router.get("/history", response_model=List[InventoryTransactionOut])
def get_inventory_history(limit: int = 50, db: Session = Depends(get_db)):
    txs = db.query(InventoryTransaction).order_by(InventoryTransaction.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": tx.id,
            "transaction_type": tx.transaction_type,
            "quantity": tx.quantity,
            "balance_after": tx.balance_after,
            "product_name": tx.inventory_item.product.name if tx.inventory_item else "General Item",
            "warehouse_name": tx.inventory_item.warehouse.name if tx.inventory_item else "Central Base",
            "reference_number": tx.reference_number,
            "notes": tx.notes,
            "timestamp": tx.timestamp
        }
        for tx in txs
    ]

@router.get("/export-csv")
def export_inventory_csv(db: Session = Depends(get_db)):
    items = db.query(InventoryItem).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Warehouse Code", "Warehouse Name", "Product SKU", "Product Name",
        "Category", "Quantity On Hand", "Isolation Adjusted DoS", "Stock Truth Score", "Spoilage Risk Index"
    ])
    
    for item in items:
        writer.writerow([
            item.warehouse.code,
            item.warehouse.name,
            item.product.sku,
            item.product.name,
            item.product.category.name if item.product.category else "N/A",
            item.quantity_on_hand,
            item.isolation_adjusted_dos,
            item.stock_truth_score,
            item.spoilage_risk_index
        ])
        
    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=project_shikhar_inventory_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.csv"}
    )

@router.post("/receive")
def receive_inventory(payload: ReceiveStockRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(InventoryItem).filter(
        InventoryItem.warehouse_id == payload.warehouse_id,
        InventoryItem.product_id == payload.product_id
    ).first()
    
    if not item:
        item = InventoryItem(
            warehouse_id=payload.warehouse_id,
            product_id=payload.product_id,
            quantity_on_hand=0.0
        )
        db.add(item)
        db.flush()
        
    # Create or update batch
    exp_dt = payload.expiry_date.replace(tzinfo=None) if payload.expiry_date.tzinfo else payload.expiry_date
    mfg_dt = payload.manufacture_date.replace(tzinfo=None) if payload.manufacture_date.tzinfo else payload.manufacture_date
    batch = InventoryBatch(
        inventory_id=item.id,
        batch_number=payload.batch_number,
        initial_quantity=payload.quantity,
        current_quantity=payload.quantity,
        manufacture_date=mfg_dt,
        expiry_date=exp_dt,
        dynamic_remaining_shelf_life_days=max(1.0, (exp_dt - datetime.utcnow()).total_seconds() / 86400.0),
        quality_status="OPTIMAL"
    )
    db.add(batch)
    
    item.quantity_on_hand += payload.quantity
    
    # Cryptographic SHA-256 Tamper-Evident Digest
    operator_tag = current_user.username if current_user else "TACTICAL_LEDGER"
    tx_digest = hashlib.sha256(
        f"{item.id}:{payload.quantity}:{payload.batch_number}:{operator_tag}:{datetime.utcnow().isoformat()}".encode()
    ).hexdigest()[:16].upper()

    # Record transaction
    ref_code = payload.reference_number or f"REC-{datetime.utcnow().strftime('%Y%m%d%H%M')}"
    tx = InventoryTransaction(
        inventory_id=item.id,
        transaction_type="RECEIVE",
        quantity=payload.quantity,
        balance_after=item.quantity_on_hand,
        performed_by_id=current_user.id if current_user else None,
        reference_number=f"{ref_code}#SHA256:{tx_digest}",
        notes=payload.notes or "Standard inbound military logistics intake"
    )
    db.add(tx)
    db.commit()
    
    return {
        "status": "SUCCESS",
        "message": f"Successfully received {payload.quantity} units into {item.warehouse.name}.",
        "new_balance": item.quantity_on_hand,
        "batch_number": payload.batch_number,
        "cryptographic_audit_hash": f"SHA256:{tx_digest}",
        "authenticated_operator": operator_tag
    }

@router.post("/dispatch")
def dispatch_inventory(payload: DispatchStockRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(InventoryItem).filter(
        InventoryItem.warehouse_id == payload.warehouse_id,
        InventoryItem.product_id == payload.product_id
    ).first()
    
    if not item or item.quantity_on_hand < payload.quantity:
        available = item.quantity_on_hand if item else 0.0
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient inventory on hand. Requested {payload.quantity}, Available: {available}."
        )
        
    item.quantity_on_hand -= payload.quantity
    
    operator_tag = current_user.username if current_user else "TACTICAL_LEDGER"
    tx_digest = hashlib.sha256(
        f"{item.id}:{-payload.quantity}:{payload.destination}:{operator_tag}:{datetime.utcnow().isoformat()}".encode()
    ).hexdigest()[:16].upper()

    ref_code = payload.reference_number or f"DSP-{datetime.utcnow().strftime('%Y%m%d%H%M')}"
    tx = InventoryTransaction(
        inventory_id=item.id,
        transaction_type="DISPATCH",
        quantity=-payload.quantity,
        balance_after=item.quantity_on_hand,
        performed_by_id=current_user.id if current_user else None,
        reference_number=f"{ref_code}#SHA256:{tx_digest}",
        notes=f"Dispatched to {payload.destination}. {payload.notes or ''}"
    )
    db.add(tx)
    db.commit()
    
    return {
        "status": "SUCCESS",
        "message": f"Dispatched {payload.quantity} units to {payload.destination}.",
        "remaining_balance": item.quantity_on_hand,
        "cryptographic_audit_hash": f"SHA256:{tx_digest}",
        "authenticated_operator": operator_tag
    }

@router.post("/transfer")
def transfer_inventory(payload: TransferStockRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.source_warehouse_id == payload.dest_warehouse_id:
        raise HTTPException(status_code=400, detail="Source and destination warehouses cannot be the same.")
        
    source_item = db.query(InventoryItem).filter(
        InventoryItem.warehouse_id == payload.source_warehouse_id,
        InventoryItem.product_id == payload.product_id
    ).first()
    
    if not source_item or source_item.quantity_on_hand < payload.quantity:
        avail = source_item.quantity_on_hand if source_item else 0.0
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock at source warehouse. Requested {payload.quantity}, Available: {avail}."
        )
        
    # Reserve stock at source
    source_item.quantity_on_hand -= payload.quantity
    source_item.quantity_in_transit += payload.quantity
    
    transfer_code = f"XFER-{datetime.utcnow().strftime('%Y%m%d')}-{db.query(StockTransfer).count() + 101}"
    
    transfer = StockTransfer(
        transfer_code=transfer_code,
        source_warehouse_id=payload.source_warehouse_id,
        dest_warehouse_id=payload.dest_warehouse_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        status="IN_TRANSIT",
        priority=payload.priority,
        transport_mode=payload.transport_mode,
        requested_by_id=current_user.id if current_user else None,
        estimated_arrival=datetime.utcnow()
    )
    db.add(transfer)
    
    tx = InventoryTransaction(
        inventory_id=source_item.id,
        transaction_type="TRANSFER_OUT",
        quantity=-payload.quantity,
        balance_after=source_item.quantity_on_hand,
        performed_by_id=current_user.id if current_user else None,
        reference_number=transfer_code,
        notes=f"Initiated inter-warehouse tactical transfer to {transfer.dest_warehouse_id}"
    )
    db.add(tx)
    db.commit()
    
    return {
        "status": "SUCCESS",
        "transfer_code": transfer_code,
        "message": f"Tactical transfer order {transfer_code} dispatched successfully."
    }

@router.get("/{id}")
def get_product_details(id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
        
    inventory_items = db.query(InventoryItem).filter(InventoryItem.product_id == id).all()
    return {
        "product": product,
        "inventory_distribution": [
            {
                "warehouse_id": item.warehouse_id,
                "warehouse_name": item.warehouse.name,
                "quantity_on_hand": item.quantity_on_hand,
                "isolation_adjusted_dos": item.isolation_adjusted_dos,
                "batches_count": len(item.batches)
            }
            for item in inventory_items
        ]
    }

@router.put("/{id}")
def update_product(id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
        
    update_data = payload.dict(exclude_unset=True)
    for key, val in update_data.items():
        setattr(product, key, val)
    db.commit()
    db.refresh(product)
    return {"status": "SUCCESS", "message": f"Product {product.sku} updated successfully."}

@router.delete("/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
        
    # Check if active stock exists
    active_qty = db.query(func.sum(InventoryItem.quantity_on_hand)).filter(InventoryItem.product_id == id).scalar() or 0.0
    if active_qty > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete product with {active_qty} units on hand. Dispatch stock first.")
        
    db.delete(product)
    db.commit()
    return {"status": "SUCCESS", "message": "Product and associated records removed safely."}
