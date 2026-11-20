from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.warehouse import Warehouse, WarehouseCapability
from app.models.inventory import InventoryItem, Product
from app.schemas.warehouse import WarehouseOut, WarehouseCreate, WarehouseUpdate

router = APIRouter(prefix="/warehouses", tags=["Multi-Warehouse Management"])

@router.get("", response_model=List[WarehouseOut])
def list_warehouses(db: Session = Depends(get_db)):
    warehouses = db.query(Warehouse).all()
    out = []
    for wh in warehouses:
        sku_count = db.query(InventoryItem).filter(InventoryItem.warehouse_id == wh.id).count()
        util = round((wh.current_load_tons / wh.total_capacity_tons) * 100.0, 1) if wh.total_capacity_tons > 0 else 0.0
        out.append({
            "id": wh.id,
            "code": wh.code,
            "name": wh.name,
            "command_region": wh.command_region,
            "latitude": wh.latitude,
            "longitude": wh.longitude,
            "elevation_meters": wh.elevation_meters,
            "total_capacity_tons": wh.total_capacity_tons,
            "current_load_tons": wh.current_load_tons,
            "isolation_risk_score": wh.isolation_risk_score,
            "stock_truth_score": wh.stock_truth_score,
            "status": wh.status,
            "climate_zone": wh.climate_zone,
            "cold_chain_capable": wh.cold_chain_capable,
            "hazardous_pol_capable": wh.hazardous_pol_capable,
            "drone_hub_capable": wh.drone_hub_capable,
            "helipad_available": wh.helipad_available,
            "created_at": wh.created_at,
            "updated_at": wh.updated_at,
            "utilization_percentage": util,
            "total_sku_count": sku_count,
            "capabilities": wh.capabilities
        })
    return out

@router.post("", response_model=WarehouseOut)
def create_warehouse(payload: WarehouseCreate, db: Session = Depends(get_db)):
    existing = db.query(Warehouse).filter(Warehouse.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Warehouse code {payload.code} already exists.")
        
    wh = Warehouse(**payload.dict())
    db.add(wh)
    db.commit()
    db.refresh(wh)
    
    # Add default capabilities
    default_caps = [
        ("Cold Chain Storage (-20C)", 100.0 if wh.cold_chain_capable else 0.0),
        ("Ammunition & Ordnance Vault", 95.0),
        ("POL Drum Storage & Flow Sensors", 98.0 if wh.hazardous_pol_capable else 0.0),
        ("Helipad & Tactical Rotary Echelon", 100.0 if wh.helipad_available else 0.0)
    ]
    for cap_name, readiness in default_caps:
        db.add(WarehouseCapability(
            warehouse_id=wh.id,
            capability_name=cap_name,
            readiness_percentage=readiness,
            is_active=readiness > 0
        ))
    db.commit()
    db.refresh(wh)
    
    return {
        **wh.__dict__,
        "utilization_percentage": round((wh.current_load_tons / wh.total_capacity_tons) * 100.0, 1),
        "total_sku_count": 0,
        "capabilities": wh.capabilities
    }

@router.get("/{id}", response_model=WarehouseOut)
def get_warehouse(id: int, db: Session = Depends(get_db)):
    wh = db.query(Warehouse).filter(Warehouse.id == id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found.")
        
    sku_count = db.query(InventoryItem).filter(InventoryItem.warehouse_id == wh.id).count()
    util = round((wh.current_load_tons / wh.total_capacity_tons) * 100.0, 1) if wh.total_capacity_tons > 0 else 0.0
    
    return {
        **wh.__dict__,
        "utilization_percentage": util,
        "total_sku_count": sku_count,
        "capabilities": wh.capabilities
    }

@router.put("/{id}")
def update_warehouse(id: int, payload: WarehouseUpdate, db: Session = Depends(get_db)):
    wh = db.query(Warehouse).filter(Warehouse.id == id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found.")
        
    for key, val in payload.dict(exclude_unset=True).items():
        setattr(wh, key, val)
    db.commit()
    db.refresh(wh)
    return {"status": "SUCCESS", "message": f"Warehouse {wh.code} updated successfully."}

@router.get("/{id}/inventory")
def get_warehouse_inventory(id: int, db: Session = Depends(get_db)):
    items = db.query(InventoryItem).filter(InventoryItem.warehouse_id == id).all()
    return [
        {
            "id": i.id,
            "product_name": i.product.name,
            "sku": i.product.sku,
            "category": i.product.category.name if i.product.category else "Defense Supply",
            "quantity_on_hand": i.quantity_on_hand,
            "isolation_adjusted_dos": i.isolation_adjusted_dos,
            "stock_truth_score": i.stock_truth_score,
            "reorder_threshold": i.product.reorder_threshold,
            "is_low_stock": i.quantity_on_hand <= i.product.reorder_threshold
        }
        for i in items
    ]
