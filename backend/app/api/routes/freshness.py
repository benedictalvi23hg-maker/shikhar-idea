from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.inventory import InventoryBatch, InventoryItem, Product
from app.schemas.intelligence import FreshnessPredictRequest, FreshnessPredictionOut
from app.ml.shelf_life_arrhenius import ArrheniusDegradationEngine
from app.models.intelligence import FreshnessPrediction

router = APIRouter(prefix="/freshness", tags=["Freshness & Spoilage Prediction"])

@router.post("/predict", response_model=FreshnessPredictionOut)
def predict_batch_freshness(payload: FreshnessPredictRequest, db: Session = Depends(get_db)):
    batch = db.query(InventoryBatch).filter(InventoryBatch.id == payload.batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Inventory batch not found.")
        
    product = batch.inventory_item.product
    
    # Use override or simulate current temperature based on product profile
    current_temp = payload.temperature_override_c if payload.temperature_override_c is not None else 6.5
    humidity = payload.humidity_override_pct if payload.humidity_override_pct is not None else 55.0
    
    calc = ArrheniusDegradationEngine.compute_dynamic_rsl(
        manufacture_date=batch.manufacture_date,
        nominal_expiry_date=batch.expiry_date,
        current_temp_c=current_temp,
        reference_temp_c=product.min_safe_temp_c if product.min_safe_temp_c > 0 else 4.0,
        activation_energy_kj=85.0,
        humidity_pct=humidity
    )
    
    # Update batch in DB
    batch.dynamic_remaining_shelf_life_days = calc["dynamic_remaining_shelf_life_days"]
    batch.quality_status = calc["risk_classification"]
    
    pred = FreshnessPrediction(
        batch_id=batch.id,
        remaining_shelf_life_days=calc["dynamic_remaining_shelf_life_days"],
        nominal_remaining_days=calc["nominal_remaining_days"],
        shelf_life_depletion_velocity=calc["depletion_velocity"],
        risk_classification=calc["risk_classification"],
        recommended_action=calc["recommended_action"],
        inspection_mandated=calc["inspection_mandated"]
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)
    
    return {
        "id": pred.id,
        "batch_id": batch.id,
        "batch_number": batch.batch_number,
        "product_name": product.name,
        "category": product.category.name if product.category else "Perishable Rations",
        "manufacture_date": batch.manufacture_date,
        "nominal_expiry_date": batch.expiry_date,
        "dynamic_remaining_shelf_life_days": calc["dynamic_remaining_shelf_life_days"],
        "nominal_remaining_days": calc["nominal_remaining_days"],
        "shelf_life_depletion_velocity": calc["depletion_velocity"],
        "current_temperature_c": current_temp,
        "activation_energy_kj": 85.0,
        "risk_classification": calc["risk_classification"],
        "recommended_action": calc["recommended_action"],
        "inspection_mandated": calc["inspection_mandated"],
        "prediction_timestamp": pred.prediction_timestamp
    }

@router.get("/batches")
def get_monitored_batches(db: Session = Depends(get_db)):
    batches = db.query(InventoryBatch).all()
    out = []
    for b in batches:
        product = b.inventory_item.product if b.inventory_item else None
        warehouse = b.inventory_item.warehouse if b.inventory_item else None
        out.append({
            "id": b.id,
            "batch_number": b.batch_number,
            "product_name": product.name if product else "Medical Blood Units",
            "warehouse_name": warehouse.name if warehouse else "Base Depot",
            "quantity": b.current_quantity,
            "expiry_date": b.expiry_date.strftime("%Y-%m-%d"),
            "dynamic_rsl_days": b.dynamic_remaining_shelf_life_days or 45.0,
            "quality_status": b.quality_status,
            "smart_drum_fill_pct": b.smart_drum_fill_pct
        })
    return out

@router.get("/risks")
def get_freshness_risks(db: Session = Depends(get_db)):
    batches = db.query(InventoryBatch).filter(
        InventoryBatch.quality_status.in_(["ELEVATED_RISK", "CRITICAL", "SPOILED"])
    ).all()
    return [
        {
            "batch_id": b.id,
            "batch_number": b.batch_number,
            "product_name": b.inventory_item.product.name if b.inventory_item else "General",
            "warehouse_name": b.inventory_item.warehouse.name if b.inventory_item else "Depot",
            "quantity": b.current_quantity,
            "quality_status": b.quality_status,
            "dynamic_rsl_days": b.dynamic_remaining_shelf_life_days or 8.0,
            "action": "EXPEDITE: Cold-chain exposure or approaching critical threshold."
        }
        for b in batches
    ]
