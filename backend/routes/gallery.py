from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db, GalleryImage

router = APIRouter(prefix="/api/gallery", tags=["gallery"])

# Pydantic Models
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
        orm_mode = True

@router.get("", response_model=List[GalleryItemResponse])
def get_gallery(limit: int = 50, db: Session = Depends(get_db)):
    """Get gallery images, newest first."""
    return db.query(GalleryImage).order_by(desc(GalleryImage.created_at)).limit(limit).all()

@router.post("", response_model=GalleryItemResponse)
def add_to_gallery(item: GalleryItemCreate, db: Session = Depends(get_db)):
    """Save an image reference to gallery."""
    db_item = GalleryImage(
        filename=item.filename,
        subfolder=item.subfolder,
        prompt_positive=item.prompt_positive,
        prompt_negative=item.prompt_negative,
        model=item.model,
        width=item.width,
        height=item.height,
        steps=item.steps,
        cfg=item.cfg
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{id}")
def delete_from_gallery(id: int, db: Session = Depends(get_db)):
    """Remove image from gallery history (does not delete file)."""
    item = db.query(GalleryImage).filter(GalleryImage.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Image not found")
    
    db.delete(item)
    db.commit()
    return {"status": "deleted", "id": id}
@router.delete("")
def clear_gallery(db: Session = Depends(get_db)):
    """Clear all images from gallery history."""
    db.query(GalleryImage).delete()
    db.commit()
    return {"status": "cleared"}
