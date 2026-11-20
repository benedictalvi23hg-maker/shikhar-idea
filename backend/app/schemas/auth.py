from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in_seconds: Optional[int] = 86400
    user_info: dict

class LoginRequest(BaseModel):
    username_or_email: str
    password: str
    remember_me: bool = False

class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    military_rank: Optional[str] = "Logistics Officer"
    service_id: Optional[str] = None
    department: Optional[str] = "Northern Command HQ"

class UserCreate(UserBase):
    password: str
    roles: List[str] = ["Logistics Manager"]

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    military_rank: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None
    roles: Optional[List[str]] = None

class UserOut(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    roles: List[str] = []
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True
