from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ForecastRunRequest(BaseModel):
    product_id: int
    warehouse_id: int
    horizon_days: int = 30
    model_override: Optional[str] = None # None means U4 Forecast Router chooses automatically

class ForecastPointOut(BaseModel):
    date: str
    predicted_demand: float
    confidence_lower: float
    confidence_upper: float
    actual_demand: Optional[float] = None

class ForecastSummaryOut(BaseModel):
    product_id: int
    product_name: str
    warehouse_id: int
    warehouse_name: str
    model_used: str
    provenance: str # ACTUAL, ESTIMATED, SIMULATED
    confidence_score: float
    historical_rmse: float
    forecast_points: List[ForecastPointOut]

class FreshnessPredictRequest(BaseModel):
    batch_id: int
    temperature_override_c: Optional[float] = None
    humidity_override_pct: Optional[float] = None

class FreshnessPredictionOut(BaseModel):
    id: int
    batch_id: int
    batch_number: str
    product_name: str
    category: str
    manufacture_date: datetime
    nominal_expiry_date: datetime
    dynamic_remaining_shelf_life_days: float
    nominal_remaining_days: float
    shelf_life_depletion_velocity: float
    current_temperature_c: float
    activation_energy_kj: float
    risk_classification: str
    recommended_action: str
    inspection_mandated: bool
    prediction_timestamp: datetime

    class Config:
        from_attributes = True

class WeatherObservationOut(BaseModel):
    id: int
    warehouse_name: Optional[str] = None
    region_name: str
    temperature_c: float
    humidity_percent: float
    rainfall_mm: float
    snowfall_cm: float
    wind_speed_kmh: float
    visibility_km: float
    environmental_threat_code: str
    satellite_cloud_index: float
    provider_source: str
    timestamp: datetime

    class Config:
        from_attributes = True

class RecommendationOut(BaseModel):
    id: int
    recommendation_code: str
    title: str
    category: str
    urgency: str
    description: str
    source_warehouse_name: Optional[str] = None
    target_warehouse_name: Optional[str] = None
    product_name: Optional[str] = None
    recommended_quantity: Optional[float] = None
    challenger_verification_status: str
    challenger_rationale: Optional[str] = None
    alternative_strategy: Optional[str] = None
    confidence_score: float
    approval_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class RecommendationActionRequest(BaseModel):
    action: str # "APPROVE" or "REJECT"
    tactical_rationale: str
