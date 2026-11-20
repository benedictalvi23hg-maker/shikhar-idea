from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User, Role
from app.models.system import AuditLog, IntegrationSetting
from app.schemas.auth import UserOut, UserCreate, UserUpdate
from app.schemas.admin import AuditLogOut, IntegrationSettingOut, IntegrationSettingUpdate
from app.core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["Security & Administration"])

@router.get("/users", response_model=List[UserOut])
def list_system_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    out = []
    for u in users:
        roles = [r.name for r in u.roles]
        out.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "full_name": u.full_name,
            "military_rank": u.military_rank,
            "service_id": u.service_id,
            "department": u.department,
            "is_active": u.is_active,
            "is_superuser": u.is_superuser,
            "roles": roles,
            "created_at": u.created_at,
            "last_login": u.last_login
        })
    return out

@router.post("/users", response_model=UserOut)
def create_system_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.username == payload.username) | (User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered.")
        
    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        military_rank=payload.military_rank,
        service_id=payload.service_id,
        department=payload.department,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Assign roles
    for r_name in payload.roles:
        role = db.query(Role).filter(Role.name == r_name).first()
        if role:
            user.roles.append(role)
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "military_rank": user.military_rank,
        "service_id": user.service_id,
        "department": user.department,
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
        "roles": [r.name for r in user.roles],
        "created_at": user.created_at,
        "last_login": user.last_login
    }

@router.put("/users/{id}")
def update_user_status(id: int, payload: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    for key, val in payload.dict(exclude_unset=True).items():
        if key == "roles" and val is not None:
            user.roles = []
            for r_name in val:
                role = db.query(Role).filter(Role.name == r_name).first()
                if role:
                    user.roles.append(role)
        else:
            setattr(user, key, val)
    db.commit()
    return {"status": "SUCCESS", "message": f"User {user.username} record updated."}

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    out = []
    for l in logs:
        out.append({
            "id": l.id,
            "user_name": l.user.full_name if l.user else "System Daemon",
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "ip_address": l.ip_address,
            "details": l.details,
            "timestamp": l.timestamp
        })
    return out

@router.get("/integrations", response_model=List[IntegrationSettingOut])
def get_integrations(db: Session = Depends(get_db)):
    return db.query(IntegrationSetting).all()

@router.put("/integrations/{id}")
def update_integration(id: int, payload: IntegrationSettingUpdate, db: Session = Depends(get_db)):
    item = db.query(IntegrationSetting).filter(IntegrationSetting.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Integration record not found.")
    item.status = payload.status
    item.endpoint_url = payload.endpoint_url
    item.is_enabled = payload.is_enabled
    item.notes = payload.notes
    db.commit()
    return {"status": "SUCCESS", "message": f"Integration {item.service_name} updated."}
