from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User, RoleEnum
from db.schemas import UserResponse
from core.security import verify_password, create_access_token, get_password_hash
from core.config import settings
from api.dependencies import get_current_user, require_role

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/seed_admin", response_model=UserResponse)
def seed_admin(db: Session = Depends(get_db)):
    # Helper for the demo to ensure at least one admin exists
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if admin:
        return admin
    
    new_admin = User(
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        role=RoleEnum.ADMIN
    )
    db.add(new_admin)
    
    manager = User(
        email="manager@example.com",
        hashed_password=get_password_hash("manager123"),
        role=RoleEnum.FINANCE_MANAGER
    )
    db.add(manager)
    
    auditor = User(
        email="auditor@example.com",
        hashed_password=get_password_hash("auditor123"),
        role=RoleEnum.AUDITOR
    )
    db.add(auditor)
    
    db.commit()
    db.refresh(new_admin)
    return new_admin
