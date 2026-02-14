
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from database import get_db, AppConfig, GenerationPreset, User
from auth import get_current_user

router = APIRouter(prefix="/api/store", tags=["store"])

# Pydantic Models for API
class ConfigItem(BaseModel):
    key: str
    value: str

class PresetCreate(BaseModel):
    name: str
    prompt_positive: str
    prompt_negative: str = ""
    model: str
    loras: List[str] = []
    width: int
    height: int
    steps: int
    cfg: float

class PresetResponse(PresetCreate):
    id: int
    
    class Config:
        orm_mode = True

# --- Config Endpoints ---

@router.get("/config/{key}")
def get_config(key: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(AppConfig).filter(AppConfig.key == key, AppConfig.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Config key not found")
    return {"key": item.key, "value": item.value}

@router.post("/config")
def set_config(item: ConfigItem, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db_item = db.query(AppConfig).filter(AppConfig.key == item.key, AppConfig.user_id == user.id).first()
    if db_item:
        db_item.value = item.value
    else:
        db_item = AppConfig(key=item.key, value=item.value, user_id=user.id)
        db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/config")
def get_all_config(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get all settings as a dictionary."""
    items = db.query(AppConfig).filter(AppConfig.user_id == user.id).all()
    return {item.key: item.value for item in items}

# --- Preset Endpoints ---

@router.get("/presets", response_model=List[PresetResponse])
def get_presets(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(GenerationPreset).filter(GenerationPreset.user_id == user.id).all()

@router.post("/presets", response_model=PresetResponse)
def create_preset(preset: PresetCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if db.query(GenerationPreset).filter(GenerationPreset.name == preset.name, GenerationPreset.user_id == user.id).first():
        raise HTTPException(status_code=400, detail="Preset name already exists")

    db_preset = GenerationPreset(
        name=preset.name,
        prompt_positive=preset.prompt_positive,
        prompt_negative=preset.prompt_negative,
        model=preset.model,
        loras=preset.loras,
        width=preset.width,
        height=preset.height,
        steps=preset.steps,
        cfg=preset.cfg,
        user_id=user.id,
    )
    db.add(db_preset)
    db.commit()
    db.refresh(db_preset)
    return db_preset

@router.delete("/presets/{name}")
def delete_preset(name: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    preset = db.query(GenerationPreset).filter(GenerationPreset.name == name, GenerationPreset.user_id == user.id).first()
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")

    db.delete(preset)
    db.commit()
    return {"status": "deleted", "name": name}
