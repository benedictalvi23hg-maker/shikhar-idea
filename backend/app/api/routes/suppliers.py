from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.logistics import Supplier, SupplierDelivery
from app.schemas.logistics import SupplierOut, SupplierCreate, SupplierUpdate

router = APIRouter(prefix="/suppliers", tags=["Supplier Risk Intelligence"])

@router.get("", response_model=List[SupplierOut])
def list_suppliers(db: Session = Depends(get_db)):
    suppliers = db.query(Supplier).all()
    out = []
    for s in suppliers:
        active_del = db.query(SupplierDelivery).filter(
            SupplierDelivery.supplier_id == s.id,
            SupplierDelivery.status != "DELIVERED"
        ).count()
        out.append({
            "id": s.id,
            "code": s.code,
            "name": s.name,
            "category": s.category,
            "reliability_score": s.reliability_score,
            "on_time_delivery_rate": s.on_time_delivery_rate,
            "quality_pass_rate": s.quality_pass_rate,
            "lead_time_days": s.lead_time_days,
            "risk_level": s.risk_level,
            "contact_person": s.contact_person,
            "email": s.email,
            "phone": s.phone,
            "address": s.address,
            "is_active": s.is_active,
            "created_at": s.created_at,
            "active_deliveries_count": active_del
        })
    return out

@router.post("", response_model=SupplierOut)
def create_supplier(payload: SupplierCreate, db: Session = Depends(get_db)):
    existing = db.query(Supplier).filter(Supplier.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Supplier code {payload.code} already exists.")
        
    s = Supplier(**payload.dict())
    db.add(s)
    db.commit()
    db.refresh(s)
    return {
        **s.__dict__,
        "active_deliveries_count": 0
    }

@router.get("/{id}", response_model=SupplierOut)
def get_supplier(id: int, db: Session = Depends(get_db)):
    s = db.query(Supplier).filter(Supplier.id == id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Supplier not found.")
    active_del = db.query(SupplierDelivery).filter(
        SupplierDelivery.supplier_id == s.id,
        SupplierDelivery.status != "DELIVERED"
    ).count()
    return {
        **s.__dict__,
        "active_deliveries_count": active_del
    }

@router.put("/{id}")
def update_supplier(id: int, payload: SupplierUpdate, db: Session = Depends(get_db)):
    s = db.query(Supplier).filter(Supplier.id == id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Supplier not found.")
    for key, val in payload.dict(exclude_unset=True).items():
        setattr(s, key, val)
    db.commit()
    db.refresh(s)
    return {"status": "SUCCESS", "message": f"Supplier {s.name} updated."}

@router.get("/{id}/performance")
def get_supplier_performance(id: int, db: Session = Depends(get_db)):
    s = db.query(Supplier).filter(Supplier.id == id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Supplier not found.")
    deliveries = db.query(SupplierDelivery).filter(SupplierDelivery.supplier_id == id).all()
    return {
        "supplier_name": s.name,
        "reliability_score": s.reliability_score,
        "on_time_delivery_rate": s.on_time_delivery_rate,
        "quality_pass_rate": s.quality_pass_rate,
        "historical_deliveries": [
            {
                "po_number": d.po_number,
                "ordered_qty": d.ordered_quantity,
                "status": d.status,
                "delay_days": d.delay_days,
                "inspection_passed": d.inspection_passed
            }
            for d in deliveries
        ]
    }
