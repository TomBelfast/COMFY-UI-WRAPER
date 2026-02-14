
"""
ComfyUI Proxy Routes
Refactored for Atomic Architecture.
"""
import random
import logging
from typing import Dict, Any

import httpx
from fastapi import APIRouter, HTTPException, Query, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db, AppConfig
from schemas.comfy_schemas import ImageGenerateRequest, ImageStatusResponse
from services.workflow_service import build_comfy_workflow
from services.websocket_manager import get_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/comfy", tags=["comfy"])

# Configuration
DEFAULT_COMFYUI_URL = "http://192.168.0.14:8188"

def get_comfy_url(db: Session) -> str:
    """Get ComfyUI URL from DB or default."""
    config = db.query(AppConfig).filter(AppConfig.key == "comfyui_url").first()
    return config.value if config else DEFAULT_COMFYUI_URL

@router.get("/health")
async def comfy_health(db: Session = Depends(get_db)):
    """Check if ComfyUI is online."""
    url = get_comfy_url(db)
    try:
        async with httpx.AsyncClient(timeout=5.0, trust_env=False) as client:
            response = await client.get(f"{url}/system_stats")
            if response.status_code == 200:
                data = response.json()
                return {
                    "status": "connected",
                    "comfyui_url": url,
                    "devices": data.get("devices", [])
                }
    except Exception as e:
        logger.error(f"Health check connection failed to {url}: {str(e)}")
    
    return {"status": "disconnected", "comfyui_url": url, "devices": []}

@router.get("/queue")
async def get_queue(db: Session = Depends(get_db)):
    """Get ComfyUI queue status."""
    url = get_comfy_url(db)
    try:
        async with httpx.AsyncClient(timeout=10.0, trust_env=False) as client:
            response = await client.get(f"{url}/queue")
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"ComfyUI unavailable: {str(e)}")

@router.post("/generate")
async def generate_image(request: ImageGenerateRequest, db: Session = Depends(get_db)):
    """Submit a generation request to ComfyUI."""
    logger.info(f"GENERATE: Incoming request for model {request.model} with steps {request.steps}")
    url = get_comfy_url(db)
    try:
        workflow = build_comfy_workflow(request)
        logger.debug(f"GENERATE: Built workflow steps: {workflow.get('5', {}).get('inputs', {}).get('steps')}")
        
        # Use a consistent client_id to ensure we receive status updates via the specific WS connection
        ws_manager = get_manager(url)
        client_id = ws_manager.client_id
        
        async with httpx.AsyncClient(timeout=120.0, trust_env=False) as client:
            response = await client.post(
                f"{url}/prompt",
                json={"prompt": workflow, "client_id": client_id}
            )
            response.raise_for_status()
            result = response.json()
            prompt_id = result["prompt_id"]
            
            # Register metadata for auto-save via WebSocket
            ws_manager.register_metadata(prompt_id, {
                "prompt_positive": request.positive_prompt,
                "prompt_negative": request.negative_prompt,
                "model": request.model or "default",
                "width": request.width,
                "height": request.height,
                "steps": request.steps,
                "cfg": request.cfg
            })
            
            return {
                "prompt_id": prompt_id,
                "status": "queued",
                "message": "Generation started"
            }
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"ComfyUI unavailable: {str(e)}")

@router.get("/status/{prompt_id}")
async def check_status(prompt_id: str, db: Session = Depends(get_db)) -> ImageStatusResponse:
    """Check the status of a generation."""
    url = get_comfy_url(db)
    try:
        async with httpx.AsyncClient(timeout=30.0, trust_env=False) as client:
            # Check queue
            queue_response = await client.get(f"{url}/queue")
            queue_data = queue_response.json()
            
            for item in queue_data.get("queue_running", []):
                if item[1] == prompt_id:
                    return ImageStatusResponse(
                        prompt_id=prompt_id, status="processing", ready=False
                    )
            
            for item in queue_data.get("queue_pending", []):
                if item[1] == prompt_id:
                    return ImageStatusResponse(
                        prompt_id=prompt_id, status="pending", ready=False
                    )
            
            # Check history
            history_response = await client.get(f"{url}/history/{prompt_id}")
            history_data = history_response.json()
            
            prompt_data = history_data.get(prompt_id)
            if not prompt_data:
                return ImageStatusResponse(
                    prompt_id=prompt_id, status="not_found", ready=False
                )
            
            status = prompt_data.get("status", {})
            if not status.get("completed"):
                return ImageStatusResponse(
                    prompt_id=prompt_id,
                    status=status.get("status_str", "processing"),
                    ready=False
                )
            
            # Get images
            outputs = prompt_data.get("outputs", {})
            image_urls = []
            filenames = []
            first_filename = None
            first_subfolder = ""
            
            for node_id in ["7", "11", "10", "9"]:
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
                    break
            
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
        raise HTTPException(status_code=503, detail=f"ComfyUI unavailable: {str(e)}")

@router.get("/image")
async def get_image(
    filename: str = Query(...),
    type: str = Query("output"),
    subfolder: str = Query(""),
    db: Session = Depends(get_db)
):
    """Proxy image from ComfyUI."""
    url = get_comfy_url(db)
    try:
        image_url = f"{url}/view?filename={filename}&type={type}"
        if subfolder:
            image_url += f"&subfolder={subfolder}"
        
        async with httpx.AsyncClient(timeout=60.0, trust_env=False) as client:
            response = await client.get(image_url)
            response.raise_for_status()
            
            return StreamingResponse(
                iter([response.content]),
                media_type=response.headers.get("content-type", "image/png")
            )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Image not found: {str(e)}")

@router.get("/loras")
async def get_available_loras(db: Session = Depends(get_db)):
    """Get list of available LoRAs."""
    url = get_comfy_url(db)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{url}/object_info")
            response.raise_for_status()
            data = response.json()
            
            loras = []
            for node_type in ["LoraLoader", "LoraLoaderModelOnly"]:
                if node_type in data:
                    node_loras = data[node_type]["input"]["required"]["lora_name"][0]
                    loras.extend(node_loras)
            
            return {"loras": sorted(list(set(loras)))}
    except Exception as e:
        return {"loras": [], "error": str(e)}

@router.get("/models")
async def get_available_models(db: Session = Depends(get_db)):
    """Get list of available models (checkpoints)."""
    url = get_comfy_url(db)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{url}/object_info")
            response.raise_for_status()
            data = response.json()
            
            models = []
            if "CheckpointLoaderSimple" in data:
                inputs = data["CheckpointLoaderSimple"]["input"]["required"]
                if "ckpt_name" in inputs:
                    models.extend(inputs["ckpt_name"][0])

            if "UNETLoader" in data:
                inputs = data["UNETLoader"]["input"]["required"]
                if "unet_name" in inputs:
                    models.extend(inputs["unet_name"][0])
            
            return {"models": sorted(list(set(models)))}
    except Exception as e:
        return {"models": [], "error": str(e)}

@router.post("/interrupt")
async def interrupt_generation(db: Session = Depends(get_db)):
    """Interrupt current generation."""
    url = get_comfy_url(db)
    try:
        async with httpx.AsyncClient(timeout=10.0, trust_env=False) as client:
            await client.post(f"{url}/interrupt")
            return {"status": "interrupted"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.post("/clear-vram")
async def clear_vram(db: Session = Depends(get_db)):
    """Clear ComfyUI VRAM and RAM."""
    url = get_comfy_url(db)
    try:
        async with httpx.AsyncClient(timeout=10.0, trust_env=False) as client:
            await client.post(f"{url}/free", json={"unload_models": True, "free_memory": True})
            return {"status": "cleared", "message": "VRAM and RAM cleared"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time ComfyUI updates."""
    await websocket.accept()
    url = get_comfy_url(db)
    manager = get_manager(url)
    
    async def forward_message(message: Dict):
        try:
            await websocket.send_json(message)
        except Exception:
            pass

    try:
        await manager.add_client(forward_message)
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        await manager.remove_client(forward_message)
    except Exception as e:
        logger.error(f"WebSocket endpoint error: {e}")
        await manager.remove_client(forward_message)
