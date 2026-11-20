from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.intelligence import Recommendation, RecommendationApproval
from app.models.warehouse import Warehouse
from app.models.inventory import Product, InventoryItem
from app.models.logistics import CorridorReliability
from app.models.user import User
from app.schemas.intelligence import RecommendationOut, RecommendationActionRequest
from app.services.decision_engine import PredictiveLogisticsDecisionEngine
from app.core.permissions import get_current_user

router = APIRouter(prefix="/recommendations", tags=["Predictive Recommendations & Challenger AI"])

@router.get("", response_model=List[RecommendationOut])
def get_recommendations(db: Session = Depends(get_db)):
    recs = db.query(Recommendation).order_by(Recommendation.created_at.desc()).all()
    out = []
    for r in recs:
        out.append({
            "id": r.id,
            "recommendation_code": r.recommendation_code,
            "title": r.title,
            "category": r.category,
            "urgency": r.urgency,
            "description": r.description,
            "source_warehouse_name": r.source_warehouse.name if r.source_warehouse else "Strategic Logistics Hub Chandigarh",
            "target_warehouse_name": r.target_warehouse.name if r.target_warehouse else "Leh Forward High-Altitude Depot",
            "product_name": r.product.name if r.product else "Cold-Weather Tactical Goods",
            "recommended_quantity": r.recommended_quantity,
            "challenger_verification_status": r.challenger_verification_status,
            "challenger_rationale": r.challenger_rationale,
            "alternative_strategy": r.alternative_strategy,
            "confidence_score": r.confidence_score,
            "approval_status": r.approval_status,
            "created_at": r.created_at
        })
    return out

@router.post("/verify")
def trigger_challenger_verification(recommendation_id: Optional[int] = None, db: Session = Depends(get_db)):
    rec_id = recommendation_id or 1
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")
        
    passability = 0.88
    source_stock = 15000.0
    
    if rec.source_warehouse and rec.product:
        inv = db.query(InventoryItem).filter(
            InventoryItem.warehouse_id == rec.source_warehouse_id,
            InventoryItem.product_id == rec.product_id
        ).first()
        if inv:
            source_stock = inv.quantity_on_hand
            
    # Check corridor passability
    corr = db.query(CorridorReliability).first()
    if corr:
        passability = corr.passability_score
        
    challenger_res = PredictiveLogisticsDecisionEngine.verify_with_challenger_ai(
        proposed_action=rec.category,
        source_warehouse_code=rec.source_warehouse.code if rec.source_warehouse else "WH-CHD-01",
        target_warehouse_code=rec.target_warehouse.code if rec.target_warehouse else "WH-LEH-01",
        product_sku=rec.product.sku if rec.product else "SKU-GEN",
        quantity=rec.recommended_quantity or 500.0,
        corridor_passability=passability,
        source_stock_available=source_stock
    )
    
    rec.challenger_verification_status = challenger_res["status"]
    rec.challenger_rationale = challenger_res["rationale"]
    rec.alternative_strategy = challenger_res["alternative"]
    rec.confidence_score = challenger_res["confidence"]
    db.commit()
    
    return {
        "status": "SUCCESS",
        "verification": challenger_res
    }

@router.post("/{id}/action")
def take_recommendation_action(
    id: int,
    payload: RecommendationActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rec = db.query(Recommendation).filter(Recommendation.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")
        
    action_type = payload.action.upper()
    if action_type not in ["APPROVE", "REJECT"]:
        raise HTTPException(status_code=400, detail="Action must be APPROVE or REJECT.")
        
    rec.approval_status = "APPROVED_BY_COMMAND" if action_type == "APPROVE" else "REJECTED_BY_COMMAND"
    
    approval = RecommendationApproval(
        recommendation_id=rec.id,
        approved_by_id=current_user.id if current_user else 1,
        action=action_type,
        tactical_rationale=payload.tactical_rationale,
        timestamp=datetime.utcnow()
    )
    db.add(approval)
    db.commit()
    
    return {
        "status": "SUCCESS",
        "recommendation_code": rec.recommendation_code,
        "approval_status": rec.approval_status,
        "message": f"Action {action_type} recorded with tactical rationale."
    }
