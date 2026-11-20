from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AuditLogOut(BaseModel):
    id: int
    user_name: Optional[str] = "System Operator"
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    ip_address: str
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class IntegrationSettingUpdate(BaseModel):
    status: str
    endpoint_url: Optional[str] = None
    is_enabled: bool
    notes: Optional[str] = None

class IntegrationSettingOut(BaseModel):
    id: int
    service_name: str
    provider_name: str
    status: str
    is_enabled: bool
    endpoint_url: Optional[str] = None
    last_health_check: datetime
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    severity: str
    category: str
    is_read: bool
    action_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
