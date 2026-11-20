from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.logistics import TransportationRecord, CorridorReliability
from app.schemas.logistics import TransportRecordOut, CorridorOut

router = APIRouter(prefix="/transportation", tags=["Transportation Intelligence"])

@router.get("", response_model=List[TransportRecordOut])
def get_active_convoys(db: Session = Depends(get_db)):
    records = db.query(TransportationRecord).all()
    return [
        {
            "id": r.id,
            "convoy_code": r.convoy_code,
            "corridor_name": r.corridor.name if r.corridor else "Surface Tactical Route",
            "source_warehouse_name": r.source_warehouse.name,
            "dest_warehouse_name": r.dest_warehouse.name,
            "transport_mode": r.transport_mode,
            "status": r.status,
            "current_latitude": r.current_latitude,
            "current_longitude": r.current_longitude,
            "cargo_weight_kg": r.cargo_weight_kg,
            "departure_time": r.departure_time,
            "estimated_arrival": r.estimated_arrival,
            "actual_arrival": r.actual_arrival,
            "environmental_risk_level": r.environmental_risk_level,
            "notes": r.notes
        }
        for r in records
    ]

@router.get("/reliability", response_model=List[CorridorOut])
def get_corridor_reliability(db: Session = Depends(get_db)):
    corridors = db.query(CorridorReliability).all()
    return corridors

@router.post("/assess-mode-mix")
def assess_mode_mix(cargo_weight_kg: float, urgency_level: str, passability_score: float):
    """
    Implements U5 Last-Mile Mode-Mix Optimizer & U6 Lift-per-kg Prioritizer.
    """
    if passability_score < 0.45 or urgency_level == "CRITICAL_LIFE_SUPPORT":
        recommended_mode = "ROTARY_HEAVY_AIRLIFT"
        rationale = "Surface corridors severely compromised by snow accumulation. Airlift prioritized for high lift-per-kg value cargo."
        max_payload_per_sort = 4000.0 # Mi-17V5 payload limit
        sorties_required = max(1, int(cargo_weight_kg / max_payload_per_sort) + (1 if cargo_weight_kg % max_payload_per_sort > 0 else 0))
    elif passability_score < 0.70:
        recommended_mode = "LIGHT_TACTICAL_4X4_CONVOY"
        rationale = "Heavy articulated trucks restricted due to ice sheets. Recommend 4x4 high-mobility tactical echelons with snow chains."
        sorties_required = max(1, int(cargo_weight_kg / 2500.0) + 1)
    else:
        recommended_mode = "HEAVY_LOGISTICS_CONVOY"
        rationale = "Corridor clear and nominal. Standard 10-ton military supply trucks recommended for optimal fuel efficiency."
        sorties_required = max(1, int(cargo_weight_kg / 10000.0) + 1)

    return {
        "recommended_mode": recommended_mode,
        "rationale": rationale,
        "estimated_echelons_required": sorties_required,
        "corridor_passability": passability_score,
        "u6_lift_per_kg_priority": "CRITICAL" if urgency_level == "CRITICAL_LIFE_SUPPORT" else "TACTICAL_STANDARD"
    }
