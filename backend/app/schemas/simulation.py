from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ScenarioRunRequest(BaseModel):
    name: str = "Winter Blizzard Scenario 2026"
    duration_days: int = 30
    snowfall_severity: float = 0.8
    temperature_drop_c: float = -18.0
    corridor_blockage_probability: float = 0.75
    supplier_delay_days: int = 14
    demand_surge_multiplier: float = 1.4

class SimulationResultOut(BaseModel):
    id: int
    scenario_name: str
    run_timestamp: datetime
    simulated_stockouts_count: int
    critical_warehouse_name: Optional[str] = "Leh Forward High-Altitude Depot"
    overall_survival_rate_pct: float
    estimated_spoilage_units: float
    resilience_score: float
    recommended_mitigations: str
    metrics_timeline: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True
