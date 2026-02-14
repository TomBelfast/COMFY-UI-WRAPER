"""
Auth API endpoints: register, login, me, update profile.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from loguru import logger

from database import get_db, User
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, _adopt_orphaned_data,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    username: str
    password: str
    display_name: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    display_name: Optional[str]
    profile_pic: Optional[str]
    tailscale_login: Optional[str]
    comfyui_url: Optional[str]
    is_admin: bool

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    comfyui_url: Optional[str] = None


@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    is_first = db.query(User).count() == 0
    user = User(
        username=req.username,
        display_name=req.display_name or req.username,
        password_hash=hash_password(req.password),
        is_admin=is_first,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if is_first:
        _adopt_orphaned_data(db, user.id)

    token = create_access_token(user.id, user.username)
    return {"token": token, "user": UserResponse.model_validate(user)}


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.id, user.username)
    return {"token": token, "user": UserResponse.model_validate(user)}


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserResponse)
def update_me(update: ProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"Updating profile for user {user.username}. New comfyui_url: {update.comfyui_url}")
    
    if update.display_name is not None:
        user.display_name = update.display_name
    if update.comfyui_url is not None:
        user.comfyui_url = update.comfyui_url
    
    try:
        # Use merge to handle cases where user might be attached to a different session
        merged_user = db.merge(user)
        db.commit()
        db.refresh(merged_user)
        logger.success(f"Profile updated for {merged_user.username}. URL in DB: {merged_user.comfyui_url}")
        return merged_user
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update profile: {e}")
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")
