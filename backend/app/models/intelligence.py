from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class DemandHistory(Base):
    __tablename__ = "demand_history"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime, nullable=False, index=True)
    quantity_demanded = Column(Float, nullable=False)
    quantity_fulfilled = Column(Float, nullable=False)
    temperature_c = Column(Float, nullable=True)
    military_activity_level = Column(String(20), default="PEACETIME") # PEACETIME, HEIGHTENED_EXERCISE, SURGE

    product = relationship("Product", back_populates="demand_history")
    warehouse = relationship("Warehouse")

class DemandForecast(Base):
    __tablename__ = "demand_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False)
    
    forecast_date = Column(DateTime, nullable=False, index=True)
    horizon_type = Column(String(20), default="DAILY") # DAILY, WEEKLY, MONTHLY
    predicted_demand = Column(Float, nullable=False)
    confidence_lower = Column(Float, nullable=False)
    confidence_upper = Column(Float, nullable=False)
    confidence_score = Column(Float, default=0.92) # 0 to 1.0
    
    # U4 Forecast Router Provenance
    model_name = Column(String(50), default="XGBoost-Ensemble-U4") # XGBoost-Ensemble, ExponentialSmoothing, SparseCroston
    provenance_status = Column(String(20), default="ESTIMATED") # ACTUAL, ESTIMATED, SIMULATED
    training_samples_count = Column(Integer, default=365)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="demand_forecasts")
    warehouse = relationship("Warehouse")

class FreshnessPrediction(Base):
    __tablename__ = "freshness_predictions"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("inventory_batches.id", ondelete="CASCADE"), nullable=False)
    prediction_timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Physics-Informed Arrhenius Degradation (U3 & U13)
    remaining_shelf_life_days = Column(Float, nullable=False)
    nominal_remaining_days = Column(Float, nullable=False) # Without thermal acceleration
    shelf_life_depletion_velocity = Column(Float, default=1.0) # 1.0 = normal, 2.5 = 2.5x accelerated rate
    activation_energy_kj = Column(Float, default=85.0) # Arrhenius Ea
    
    risk_classification = Column(String(30), default="OPTIMAL") # OPTIMAL, ELEVATED_RISK, CRITICAL_EXPEDITE, INSPECT_IMMEDIATE
    recommended_action = Column(Text, nullable=True)
    inspection_mandated = Column(Boolean, default=False)

    batch = relationship("InventoryBatch", back_populates="freshness_predictions")

class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    region_name = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    temperature_c = Column(Float, nullable=False)
    humidity_percent = Column(Float, nullable=False)
    rainfall_mm = Column(Float, default=0.0)
    snowfall_cm = Column(Float, default=0.0)
    wind_speed_kmh = Column(Float, default=15.0)
    visibility_km = Column(Float, default=10.0)
    
    environmental_threat_code = Column(String(30), default="GREEN_NOMINAL") # GREEN_NOMINAL, AMBER_CAUTION, RED_BLIZZARD, BLACK_ISOLATED
    satellite_cloud_index = Column(Float, default=0.2)
    provider_source = Column(String(50), default="OPEN_METEO_SIMULATED")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. "REC-PREWINTER-2026-004"
    title = Column(String(200), nullable=False)
    category = Column(String(50), default="SMART_REDISTRIBUTION") # SMART_REDISTRIBUTION, EMERGENCY_BUFFER, SUPPLIER_ORDER, REROUTE
    urgency = Column(String(20), default="TACTICAL_HIGH") # NORMAL, TACTICAL_HIGH, IMMEDIATE_CRITICAL
    
    description = Column(Text, nullable=False)
    source_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    target_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    recommended_quantity = Column(Float, nullable=True)
    
    # U18 Challenger AI Verification
    challenger_verification_status = Column(String(30), default="VERIFIED_FEASIBLE") # VERIFIED_FEASIBLE, CONSTRAINED_BY_PASS, ALTERNATIVE_PROPOSED
    challenger_rationale = Column(Text, nullable=True)
    alternative_strategy = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.96)
    
    # Human Approval Flow
    approval_status = Column(String(30), default="PENDING_HUMAN_APPROVAL") # PENDING_HUMAN_APPROVAL, APPROVED, REJECTED, EXECUTED
    created_at = Column(DateTime, default=datetime.utcnow)

    source_warehouse = relationship("Warehouse", foreign_keys=[source_warehouse_id])
    target_warehouse = relationship("Warehouse", foreign_keys=[target_warehouse_id])
    product = relationship("Product")
    approvals = relationship("RecommendationApproval", back_populates="recommendation", cascade="all, delete-orphan")

class RecommendationApproval(Base):
    __tablename__ = "recommendation_approvals"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id", ondelete="CASCADE"), nullable=False)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(20), nullable=False) # APPROVED, REJECTED
    tactical_rationale = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    recommendation = relationship("Recommendation", back_populates="approvals")
    approver = relationship("User")
