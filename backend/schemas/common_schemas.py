
from datetime import datetime
from typing import List
from pydantic import BaseModel

class GalleryItemCreate(BaseModel):
    filename: str
    subfolder: str = ""
    prompt_positive: str
    prompt_negative: str = ""
    model: str
    width: int
    height: int
    steps: int
    cfg: float

class GalleryItemResponse(GalleryItemCreate):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

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
        from_attributes = True
