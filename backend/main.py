"""
ComfyUI Wrapper - Backend Entry Point
FastAPI server acting as proxy and manager for ComfyUI.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import asyncio

from routes.comfy import router as comfy_router
from routes.persistence import router as persistence_router
from routes.gallery import router as gallery_router
from routes.auth import router as auth_router
from services.websocket_manager import get_manager
from routes.comfy import DEFAULT_COMFYUI_URL
from database import init_db, SessionLocal, AppConfig
from migrate_add_auth import run_migration

from services.logging_service import log_manager
from fastapi import WebSocket, WebSocketDisconnect

# Set up loguru and intercept standard logging
log_manager.setup_logging()
from loguru import logger

app = FastAPI(
    title="ComfyUI Wrapper API",
    description="Proxy and management layer for ComfyUI",
    version="0.1.0",
)

@app.on_event("startup")
async def startup_event():
    # Set loop for logging
    log_manager.loop = asyncio.get_running_loop()
    
    # Run auth migration BEFORE init_db (migration adds columns that models now expect)
    run_migration()
    init_db()
    
    # Get Config from DB
    db = SessionLocal()
    try:
        config = db.query(AppConfig).filter(AppConfig.key == "comfyui_url").first()
        url = config.value if config else DEFAULT_COMFYUI_URL
    except Exception:
        url = DEFAULT_COMFYUI_URL
    finally:
        db.close()
    
    # Connect WS Manager in background (non-blocking)
    manager = get_manager(url)
    asyncio.create_task(manager.connect())

@app.on_event("shutdown")
async def shutdown_event():
    manager = get_manager(DEFAULT_COMFYUI_URL)
    await manager.disconnect()

# CORS for local development with Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    logger.debug(f"INCOMING REQUEST: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.debug(f"RESPONSE STATUS: {response.status_code} for {request.method} {request.url.path}")
    return response

# Include Routers
app.include_router(auth_router)
app.include_router(comfy_router)
app.include_router(persistence_router)
app.include_router(gallery_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "comfyui-wrapper-backend"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "ComfyUI Wrapper API", "docs": "/docs"}

@app.websocket("/api/logs/ws")
async def logs_websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time log streaming."""
    await websocket.accept()
    logger.info("New client connected to log stream")
    try:
        async for log_entry in log_manager.subscribe():
            await websocket.send_json(log_entry)
    except WebSocketDisconnect:
        logger.info("Client disconnected from log stream")
    except Exception as e:
        logger.error(f"Error in logs WebSocket: {e}")
