from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CorridorOut(BaseModel):
    id: int
    code: str
    name: str
    origin_region: str
    destination_region: str
    distance_km: float
    passability_score: float
    avalanche_risk_index: float
    winter_closure_active: bool
    average_transit_hours: float
    current_status: str

    class Config:
        from_attributes = True

class TransportRecordOut(BaseModel):
    id: int
    convoy_code: str
    corridor_name: Optional[str] = None
    source_warehouse_name: str
    dest_warehouse_name: str
    transport_mode: str
    status: str
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    cargo_weight_kg: float
    departure_time: datetime
    estimated_arrival: datetime
    actual_arrival: Optional[datetime] = None
    environmental_risk_level: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class SupplierBase(BaseModel):
    code: str
    name: str
    category: str
    reliability_score: float = 0.94
    on_time_delivery_rate: float = 92.5
    quality_pass_rate: float = 99.1
    lead_time_days: int = 7
    risk_level: str = "LOW_RISK"
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    reliability_score: Optional[float] = None
    on_time_delivery_rate: Optional[float] = None
    quality_pass_rate: Optional[float] = None
    lead_time_days: Optional[int] = None
    risk_level: Optional[str] = None
    is_active: Optional[bool] = None

class SupplierOut(SupplierBase):
    id: int
    created_at: datetime
    active_deliveries_count: Optional[int] = 0

    class Config:
        from_attributes = True
