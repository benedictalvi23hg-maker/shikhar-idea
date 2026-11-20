from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SensorReadingCreate(BaseModel):
    device_uid: str
    temperature_c: Optional[float] = None
    humidity_percent: Optional[float] = None
    fill_level_percent: Optional[float] = None
    drum_weight_kg: Optional[float] = None
    vibration_g: Optional[float] = None

class SensorDeviceOut(BaseModel):
    id: int
    device_uid: str
    name: str
    warehouse_name: str
    batch_number: Optional[str] = None
    device_type: str
    battery_level_pct: float
    signal_strength_dbm: float
    is_online: bool
    last_heartbeat: datetime
    latest_temperature_c: Optional[float] = None
    latest_humidity_pct: Optional[float] = None
    latest_fill_level_pct: Optional[float] = None

    class Config:
        from_attributes = True

class SyncEventCreate(BaseModel):
    client_transaction_id: str
    transaction_type: str
    payload_json: dict
    client_timestamp: datetime

class SyncEventOut(BaseModel):
    id: int
    client_transaction_id: str
    transaction_type: str
    sync_status: str
    conflict_resolution: Optional[str] = None
    server_synced_at: datetime

    class Config:
        from_attributes = True
