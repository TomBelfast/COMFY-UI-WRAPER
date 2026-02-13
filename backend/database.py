
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, JSON, DateTime
from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class AppConfig(Base):
    """Store key-value settings like API keys."""
    __tablename__ = "config"
    key = Column(String, primary_key=True, index=True)
    value = Column(String)

class GenerationPreset(Base):
    """Store generation presets."""
    __tablename__ = "presets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    prompt_positive = Column(Text)
    prompt_negative = Column(Text)
    model = Column(String)
    loras = Column(JSON) # List of LoRA names
    width = Column(Integer)
    height = Column(Integer)
    steps = Column(Integer)
    cfg = Column(Float)

class GalleryImage(Base):
    """Store generated images history."""
    __tablename__ = "gallery"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    subfolder = Column(String, default="")
    prompt_positive = Column(Text)
    prompt_negative = Column(Text)
    model = Column(String)
    width = Column(Integer)
    height = Column(Integer)
    steps = Column(Integer)
    cfg = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

def seed_defaults(db_session):
    """Seed default presets if none exist."""
    if db_session.query(GenerationPreset).first():
        return

    defaults = [
        GenerationPreset(
            name="Z-Image Turbo",
            prompt_positive="high quality, masterpiece",
            prompt_negative="blurry, text, watermark",
            model="zImageTurboFP8Kijai_fp8ScaledE4m3fn.safetensors",
            loras=[],
            width=1344,
            height=768,
            steps=8,
            cfg=1.5
        ),
        GenerationPreset(
            name="Flux Dev",
            prompt_positive="high quality, realistic, sharp focus",
            prompt_negative="blur, deformed",
            model="flux1-dev.safetensors",
            loras=[],
            width=1024,
            height=1024,
            steps=20,
            cfg=1.0
        ),
        GenerationPreset(
            name="Portrait (9:16)",
            prompt_positive="portrait, photography",
            prompt_negative="deformed",
            model="flux1-dev.safetensors",
            loras=[],
            width=768,
            height=1344,
            steps=20,
            cfg=1.0
        )
    ]
    
    for p in defaults:
        db_session.add(p)
    db_session.commit()

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_defaults(db)
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
