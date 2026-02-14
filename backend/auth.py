"""
Authentication module: Tailscale headers → JWT fallback → 401.
"""
import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from loguru import logger

from database import get_db, User

# Config
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "comfyui-wrapper-secret-change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int, username: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": str(user_id), "username": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _get_tailscale_user(request: Request, db: Session) -> Optional[User]:
    """Check Tailscale identity headers, auto-create user if new."""
    ts_login = request.headers.get("Tailscale-User-Login")
    if not ts_login:
        return None

    user = db.query(User).filter(User.tailscale_login == ts_login).first()
    if user:
        return user

    # Auto-create from Tailscale headers
    ts_name = request.headers.get("Tailscale-User-Name", ts_login.split("@")[0])
    ts_pic = request.headers.get("Tailscale-User-Profile-Pic")

    is_first = db.query(User).count() == 0
    user = User(
        username=ts_login,
        display_name=ts_name,
        profile_pic=ts_pic,
        tailscale_login=ts_login,
        is_admin=is_first,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if is_first:
        _adopt_orphaned_data(db, user.id)

    logger.info(f"Auto-created Tailscale user: {ts_login} (admin={is_first})")
    return user


def _get_jwt_user(credentials: Optional[HTTPAuthorizationCredentials], db: Session) -> Optional[User]:
    """Decode JWT Bearer token."""
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub", 0))
        if not user_id:
            return None
        return db.query(User).filter(User.id == user_id).first()
    except (JWTError, ValueError):
        return None


def _adopt_orphaned_data(db: Session, user_id: int):
    """Assign all orphaned records (user_id IS NULL) to the given user."""
    from database import AppConfig, GenerationPreset, GalleryImage
    db.query(AppConfig).filter(AppConfig.user_id.is_(None)).update({"user_id": user_id})
    db.query(GenerationPreset).filter(GenerationPreset.user_id.is_(None)).update({"user_id": user_id})
    db.query(GalleryImage).filter(GalleryImage.user_id.is_(None)).update({"user_id": user_id})
    db.commit()
    logger.info(f"Adopted orphaned data for user_id={user_id}")


async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> User:
    """FastAPI dependency: Tailscale → JWT → 401."""
    # Priority 1: Tailscale headers
    user = _get_tailscale_user(request, db)
    if user:
        return user

    # Priority 2: JWT Bearer token
    user = _get_jwt_user(credentials, db)
    if user:
        return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user_ws(token: Optional[str], db: Session) -> Optional[User]:
    """Get user from WebSocket query param token."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub", 0))
        if not user_id:
            return None
        return db.query(User).filter(User.id == user_id).first()
    except (JWTError, ValueError):
        return None
