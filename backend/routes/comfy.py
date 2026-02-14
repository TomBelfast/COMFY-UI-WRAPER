
import random
import io
import json
import httpx
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
from PIL import Image
from loguru import logger

from database import get_db, AppConfig, User
from schemas.comfy_schemas import ImageGenerateRequest, ImageStatusResponse
from services.workflow_service import build_comfy_workflow
from services.websocket_manager import get_manager
from auth import get_current_user

router = APIRouter(prefix="/api/comfy", tags=["comfy"])

# Configuration
DEFAULT_COMFYUI_URL = "http://192.168.0.14:8188"

def get_comfy_url(db: Session, user: User = None) -> str:
    """Get ComfyUI URL: per-user → per-user config → global config → default."""
    if user and user.comfyui_url:
        return user.comfyui_url
    if user:
        config = db.query(AppConfig).filter(AppConfig.key == "comfyui_url", AppConfig.user_id == user.id).first()
        if config:
            return config.value
    config = db.query(AppConfig).filter(AppConfig.key == "comfyui_url").first()
    return config.value if config else DEFAULT_COMFYUI_URL

@router.get("/debug/{msg}")
async def debug_log(msg: str):
    logger.info(f"FRONTEND DEBUG: {msg}")
    return {"status": "ok"}

@router.get("/health")
async def health_check(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Check health of backend and ComfyUI connection."""
    url = get_comfy_url(db, user)
    try:
        async with httpx.AsyncClient(timeout=5.0, trust_env=False) as client:
            resp = await client.get(f"{url}/system_stats")
            comfy_status = "connected" if resp.status_code == 200 else "error"
    except Exception as e:
        logger.error(f"ComfyUI health check failed: {e}")
        comfy_status = "offline"
    
    return {
        "status": "ok",
        "comfyui_status": comfy_status,
        "comfyui_url": url
    }

@router.get("/queue")
async def get_queue(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get ComfyUI queue status."""
    url = get_comfy_url(db, user)
    async with httpx.AsyncClient(timeout=10.0, trust_env=False) as client:
        resp = await client.get(f"{url}/queue")
        return resp.json()

@router.post("/generate")
async def generate_image(request: ImageGenerateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Submit a generation request to ComfyUI."""
    logger.info(f"GENERATE: Incoming request for model {request.model or 'default'} with workflow {request.workflow_id}")
    url = get_comfy_url(db, user)
    
    try:
        logger.debug(f"GENERATE: Building workflow for {request.workflow_id}...")
        workflow = build_comfy_workflow(request)
        
        # Log which nodes are in the workflow
        node_ids = list(workflow.keys())
        logger.info(f"GENERATE: Workflow built with {len(node_ids)} nodes: {node_ids}")
        
        # Use a consistent client_id to ensure we receive status updates via the specific WS connection
        ws_manager = get_manager(url)
        client_id = ws_manager.client_id
        
        logger.info(f"GENERATE: Sending request to ComfyUI at {url}/prompt (client_id: {client_id})")
        
        async with httpx.AsyncClient(timeout=120.0, trust_env=False) as client:
            response = await client.post(
                f"{url}/prompt",
                json={"prompt": workflow, "client_id": client_id}
            )
            
            logger.debug(f"GENERATE: ComfyUI response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"GENERATE: ComfyUI error: {response.text}")
                response.raise_for_status()
                
            result = response.json()
            prompt_id = result.get("prompt_id")
            
            if not prompt_id:
                logger.error(f"GENERATE: No prompt_id in response: {result}")
                raise HTTPException(status_code=500, detail="No prompt_id returned from ComfyUI")

            logger.success(f"GENERATE: Successfully queued prompt {prompt_id}")
            
            # Register metadata for auto-save via WebSocket
            ws_manager.register_metadata(prompt_id, {
                "prompt_positive": request.positive_prompt,
                "prompt_negative": request.negative_prompt,
                "workflow_id": request.workflow_id,
                "model": request.model or "default",
                "width": request.width,
                "height": request.height,
                "steps": request.steps,
                "cfg": request.cfg,
                "user_id": user.id,
            })
            
            return {
                "prompt_id": prompt_id,
                "status": "queued",
                "message": "Generation started"
            }
    except httpx.HTTPStatusError as e:
        logger.error(f"GENERATE: HTTP Error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail=f"ComfyUI HTTP error: {str(e)}")
    except Exception as e:
        logger.exception(f"GENERATE: Unexpected error: {e}")
        raise HTTPException(status_code=503, detail=f"ComfyUI unavailable or error: {str(e)}")

@router.get("/status/{prompt_id}")
async def check_status(prompt_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> ImageStatusResponse:
    """Check the status of a generation."""
    logger.debug(f"STATUS: Checking status for {prompt_id}")
    url = get_comfy_url(db, user)
    try:
        async with httpx.AsyncClient(timeout=30.0, trust_env=False) as client:
            # Check queue
            logger.debug(f"STATUS: Fetching queue from {url}/queue")
            queue_response = await client.get(f"{url}/queue")
            queue_data = queue_response.json()
            
            for item in queue_data.get("queue_running", []):
                if item[1] == prompt_id:
                    logger.debug(f"STATUS: Prompt {prompt_id} is currently PROCESSING")
                    return ImageStatusResponse(
                        prompt_id=prompt_id, status="processing", ready=False
                    )
            
            for item in queue_data.get("queue_pending", []):
                if item[1] == prompt_id:
                    logger.debug(f"STATUS: Prompt {prompt_id} is PENDING in queue")
                    return ImageStatusResponse(
                        prompt_id=prompt_id, status="pending", ready=False
                    )
            
            # Check history
            logger.debug(f"STATUS: Fetching history from {url}/history/{prompt_id}")
            history_response = await client.get(f"{url}/history/{prompt_id}")
            history_data = history_response.json()
            
            prompt_data = history_data.get(prompt_id)
            if not prompt_data:
                logger.debug(f"STATUS: Prompt {prompt_id} NOT FOUND in history or queue")
                return ImageStatusResponse(
                    prompt_id=prompt_id, status="not_found", ready=False
                )
            
            status = prompt_data.get("status", {})
            if not status.get("completed"):
                logger.debug(f"STATUS: Prompt {prompt_id} is INCOMPLETE in history")
                return ImageStatusResponse(
                    prompt_id=prompt_id,
                    status=status.get("status_str", "processing"),
                    ready=False
                )
            
            # Get images
            logger.info(f"STATUS: Prompt {prompt_id} COMPLETED. Extracting outputs...")
            outputs = prompt_data.get("outputs", {})
            image_urls = []
            filenames = []
            first_filename = None
            first_subfolder = ""
            
            # Look for nodes 7, 11, 10, 9 or ANY output with images
            found_images = False
            for node_id in ["7", "11", "10", "9", "45", "46"]:
                if node_id in outputs and "images" in outputs[node_id]:
                    for img in outputs[node_id]["images"]:
                        filename = img.get("filename", "")
                        subfolder = img.get("subfolder", "")
                        filenames.append(filename)
                        if not first_filename:
                            first_filename = filename
                            first_subfolder = subfolder
                        url_img = f"/api/comfy/image?filename={filename}&type=output"
                        if subfolder:
                            url_img += f"&subfolder={subfolder}"
                        image_urls.append(url_img)
                    found_images = True
                    break
            
            if not found_images:
                # Try fallback: any node with "images"
                for node_id, node_output in outputs.items():
                    if "images" in node_output:
                        for img in node_output["images"]:
                            filename = img.get("filename", "")
                            subfolder = img.get("subfolder", "")
                            filenames.append(filename)
                            if not first_filename:
                                first_filename = filename
                                first_subfolder = subfolder
                            url_img = f"/api/comfy/image?filename={filename}&type=output"
                            if subfolder:
                                url_img += f"&subfolder={subfolder}"
                            image_urls.append(url_img)
                        break

            logger.success(f"STATUS: Prompt {prompt_id} finished in ComfyUI with {len(image_urls)} images")
            
            # CRITICAL: Synchronization with Auto-Save
            # If ComfyUI is done, wait a tiny bit to see if it's already in our DB Gallery
            # This prevents the frontend from refreshing the gallery before the save is finalized.
            if first_filename:
                gallery_entry = db.query(GalleryImage).filter(GalleryImage.prompt_id == prompt_id).first()
                if not gallery_entry:
                    logger.warning(f"STATUS: Prompt {prompt_id} done in Comfy, but NOT YET in Gallery DB. Returning 'processing' to buy time.")
                    return ImageStatusResponse(
                        prompt_id=prompt_id,
                        status="saving", # Special status to indicate it's done but being saved
                        ready=False
                    )

            return ImageStatusResponse(
                prompt_id=prompt_id,
                status="completed",
                ready=True,
                filename=first_filename,
                filenames=filenames,
                subfolder=first_subfolder,
                image_url=image_urls[0] if image_urls else None,
                image_urls=image_urls
            )
    except Exception as e:
        logger.error(f"STATUS: Connection error to ComfyUI: {e}")
        raise HTTPException(status_code=503, detail=f"ComfyUI unavailable: {str(e)}")

@router.get("/image")
async def get_image(filename: str, subfolder: str = "", type: str = "output", db: Session = Depends(get_db)):
    """Retrieve an image from ComfyUI (public - used by <img src>)."""
    url = get_comfy_url(db)
    async with httpx.AsyncClient(timeout=30.0, trust_env=False) as client:
        resp = await client.get(f"{url}/view?filename={filename}&subfolder={subfolder}&type={type}")
        return Response(content=resp.content, media_type=resp.headers.get("content-type"))

@router.get("/thumbnail")
async def get_thumbnail(filename: str, subfolder: str = "", max_size: int = 300, db: Session = Depends(get_db)):
    """Retrieve a thumbnail from ComfyUI (public - used by <img src>)."""
    url = get_comfy_url(db)
    async with httpx.AsyncClient(timeout=30.0, trust_env=False) as client:
        resp = await client.get(f"{url}/view?filename={filename}&subfolder={subfolder}&type=output")
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Image not found")
        img = Image.open(io.BytesIO(resp.content))
        img.thumbnail((max_size, max_size), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=80)
        buf.seek(0)
        return Response(content=buf.read(), media_type="image/webp")

@router.post("/interrupt")
async def interrupt(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Interrupt current generation."""
    url = get_comfy_url(db, user)
    async with httpx.AsyncClient(timeout=10.0, trust_env=False) as client:
        resp = await client.post(f"{url}/interrupt")
        return resp.json()

@router.post("/clear-vram")
async def clear_vram(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Clear ComfyUI VRAM (unload models)."""
    url = get_comfy_url(db, user)
    async with httpx.AsyncClient(timeout=10.0, trust_env=False) as client:
        # ComfyUI doesn't have a direct clear-vram endpoint usually, 
        # but some custom nodes do or we can trigger it via GC.
        # This is a placeholder for common practice.
        resp = await client.post(f"{url}/free")
        return resp.json()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Bridge for ComfyUI WebSocket updates."""
    await websocket.accept()
    url = "http://192.168.0.14:8188" # Fallback/Default
    
    # Try to get actual URL from DB (this is tricky in WS init but let's try)
    try:
        db = next(get_db())
        config = db.query(AppConfig).filter(AppConfig.key == "comfyui_url").first()
        if config: url = config.value
        db.close()
    except:
        pass

    manager = get_manager(url)
    
    # Define handler for broadcasts
    async def send_to_client(data):
        try:
            await websocket.send_json(data)
        except:
            await manager.remove_client(send_to_client)

    await manager.add_client(send_to_client)
    
    try:
        while True:
            # Just keep connection alive, we primarily send updates from ComfyUI -> Client
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.remove_client(send_to_client)
    except Exception as e:
        logger.error(f"WS Bridge Error: {e}")
        await manager.remove_client(send_to_client)
