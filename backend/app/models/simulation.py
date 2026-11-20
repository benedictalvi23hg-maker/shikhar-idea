from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from app.core.database import Base

class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    scenario_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. "SIM-WINTER-BLIZZARD-2026"
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Simulation Parameters (U10 Winter Rehearsal Twin)
    duration_days = Column(Integer, default=30)
    snowfall_severity = Column(Float, default=0.7) # 0 to 1
    temperature_drop_c = Column(Float, default=-15.0)
    corridor_blockage_probability = Column(Float, default=0.65)
    supplier_delay_days = Column(Integer, default=14)
    demand_surge_multiplier = Column(Float, default=1.35)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("simulation_scenarios.id", ondelete="CASCADE"), nullable=False)
    run_timestamp = Column(DateTime, default=datetime.utcnow)
    executed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Quantitative Outcomes
    simulated_stockouts_count = Column(Integer, default=0)
    critical_depletion_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    overall_survival_rate_pct = Column(Float, default=94.5)
    estimated_spoilage_units = Column(Float, default=120.0)
    resilience_score = Column(Float, default=82.0) # 0-100
    
    # Detailed time-series output JSON
    metrics_timeline = Column(JSON, nullable=True)
    recommended_mitigations = Column(Text, nullable=True)
