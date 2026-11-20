from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.schemas.auth import LoginRequest, Token, UserOut
from app.core.permissions import get_current_active_user, get_current_user

router = APIRouter(prefix="/auth", tags=["Tactical Authentication"])

# In-Memory Tactical Brute-Force Rate Limiter (DISA STIG Protocol)
FAILED_ATTEMPTS: dict[str, list[datetime]] = {}
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 10

def check_rate_limit(identity: str):
    now = datetime.utcnow()
    cutoff = now - timedelta(minutes=LOCKOUT_MINUTES)
    if identity in FAILED_ATTEMPTS:
        # Purge expired attempts
        FAILED_ATTEMPTS[identity] = [t for t in FAILED_ATTEMPTS[identity] if t > cutoff]
        if len(FAILED_ATTEMPTS[identity]) >= MAX_FAILED_ATTEMPTS:
            remaining_mins = max(1, int((FAILED_ATTEMPTS[identity][0] + timedelta(minutes=LOCKOUT_MINUTES) - now).total_seconds() / 60))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"SECURITY ALERT: Tactical account locked due to {MAX_FAILED_ATTEMPTS} consecutive failed attempts. Retry in {remaining_mins} minutes."
            )

def record_failed_attempt(identity: str):
    now = datetime.utcnow()
    if identity not in FAILED_ATTEMPTS:
        FAILED_ATTEMPTS[identity] = []
    FAILED_ATTEMPTS[identity].append(now)

def clear_failed_attempts(identity: str):
    if identity in FAILED_ATTEMPTS:
        del FAILED_ATTEMPTS[identity]

@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    identity = payload.username_or_email.strip().lower()
    check_rate_limit(identity)

    user = db.query(User).filter(
        (User.username == payload.username_or_email) | (User.email == payload.username_or_email)
    ).first()
    
    if not user or not verify_password(payload.password, user.hashed_password):
        record_failed_attempt(identity)
        attempts_left = MAX_FAILED_ATTEMPTS - len(FAILED_ATTEMPTS.get(identity, []))
        detail_msg = f"Tactical credentials invalid. Access denied. ({max(0, attempts_left)} attempts remaining before security lockout)"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail_msg,
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Operator account deactivated by Military Authority.")
        
    clear_failed_attempts(identity)
    user.last_login = datetime.utcnow()
    db.commit()
    
    roles = [r.name for r in user.roles]
    token_data = {
        "sub": user.username,
        "roles": roles,
        "is_admin": user.is_superuser,
        "rank": user.military_rank or "Officer"
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in_seconds": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user_info": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "military_rank": user.military_rank,
            "department": user.department,
            "roles": roles,
            "is_superuser": user.is_superuser
        }
    }

@router.get("/verify-token")
def verify_token(current_user: User = Depends(get_current_active_user)):
    """Verifies that the provided JWT Bearer token is cryptographically valid and active."""
    return {
        "status": "VALID",
        "authenticated_as": current_user.username,
        "military_rank": current_user.military_rank,
        "department": current_user.department,
        "roles": [r.name for r in current_user.roles],
        "is_superuser": current_user.is_superuser,
        "verified_at": datetime.utcnow().isoformat() + "Z"
    }

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    user_roles = [r.name for r in current_user.roles]
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "military_rank": current_user.military_rank,
        "service_id": current_user.service_id,
        "department": current_user.department,
        "is_active": current_user.is_active,
        "is_superuser": current_user.is_superuser,
        "roles": user_roles,
        "created_at": current_user.created_at,
        "last_login": current_user.last_login
    }

@router.post("/refresh")
def refresh_token(token_payload: dict):
    refresh_tok = token_payload.get("refresh_token")
    if not refresh_tok:
        raise HTTPException(status_code=400, detail="Missing refresh token")
    data = decode_token(refresh_tok)
    if not data or data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    new_access = create_access_token({"sub": data["sub"], "roles": data.get("roles", [])})
    return {"access_token": new_access, "token_type": "bearer"}

@router.post("/logout")
def logout():
    return {"status": "SUCCESS", "message": "Tactical session terminated securely."}
