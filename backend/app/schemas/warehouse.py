from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CapabilityOut(BaseModel):
    id: int
    capability_name: str
    readiness_percentage: float
    is_active: bool
    last_certified: datetime

    class Config:
        from_attributes = True

class WarehouseBase(BaseModel):
    code: str
    name: str
    command_region: str = "Northern Command"
    latitude: float
    longitude: float
    elevation_meters: float = 1000.0
    total_capacity_tons: float = 5000.0
    current_load_tons: float = 1200.0
    isolation_risk_score: float = 0.25
    stock_truth_score: float = 0.98
    status: str = "OPERATIONAL"
    climate_zone: str = "SUB_ZERO_ALPINE"
    cold_chain_capable: bool = True
    hazardous_pol_capable: bool = True
    drone_hub_capable: bool = True
    helipad_available: bool = True

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    command_region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    elevation_meters: Optional[float] = None
    total_capacity_tons: Optional[float] = None
    current_load_tons: Optional[float] = None
    isolation_risk_score: Optional[float] = None
    stock_truth_score: Optional[float] = None
    status: Optional[str] = None
    cold_chain_capable: Optional[bool] = None
    hazardous_pol_capable: Optional[bool] = None

class WarehouseOut(WarehouseBase):
    id: int
    created_at: datetime
    updated_at: datetime
    utilization_percentage: float = 0.0
    capabilities: List[CapabilityOut] = []
    total_sku_count: Optional[int] = 0

    class Config:
        from_attributes = True
