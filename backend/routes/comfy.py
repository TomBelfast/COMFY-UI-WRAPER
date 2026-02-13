"""
ComfyUI Proxy Routes
Based on comfy.md documentation.
"""
import random
from typing import Optional, List, Dict, Any

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/comfy", tags=["comfy"])

# Configuration
DEFAULT_COMFYUI_URL = "http://192.168.0.14:8188"

from sqlalchemy.orm import Session
from fastapi import Depends
from database import get_db, AppConfig

def get_comfy_url(db: Session) -> str:
    """Get ComfyUI URL from DB or default."""
    config = db.query(AppConfig).filter(AppConfig.key == "comfyui_url").first()
    return config.value if config else DEFAULT_COMFYUI_URL


class ImageGenerateRequest(BaseModel):
    """Request to generate an image."""
    positive_prompt: str
    negative_prompt: str = "blurry, low quality, text, watermark"
    width: int = 1088
    height: int = 1920
    model: Optional[str] = None
    loras_names: Optional[List[str]] = None
    lora_names: Optional[List[str]] = None # Backwards compatibility
    steps: int = 8
    cfg: float = 1.0
    sampler_name: str = "res_multistep"
    batch_size: int = 1


class ImageStatusResponse(BaseModel):
    """Response with generation status."""
    prompt_id: str
    status: str
    ready: bool
    filename: Optional[str] = None
    filenames: List[str] = Field(default_factory=list)
    subfolder: Optional[str] = None
    image_url: Optional[str] = None
    image_urls: List[str] = Field(default_factory=list)


# Z-Image Turbo AIO Workflow (All-In-One checkpoint)
# Based on: workflow/Projekt_generowanie_zdjec_z_image_turbo_AIO.json
TURBO_AIO_WORKFLOW = {
    "1": {"inputs": {"ckpt_name": "z-image-turbo-bf16-aio.safetensors"}, "class_type": "CheckpointLoaderSimple"},
    "2": {"inputs": {"text": "", "clip": ["1", 1]}, "class_type": "CLIPTextEncode"},
    "3": {"inputs": {"conditioning": ["2", 0]}, "class_type": "ConditioningZeroOut"},
    "4": {"inputs": {"width": 1088, "height": 1920, "batch_size": 1}, "class_type": "EmptySD3LatentImage"},
    "5": {"inputs": {"seed": 0, "steps": 8, "cfg": 1, "sampler_name": "res_multistep", "scheduler": "simple", "denoise": 1, "model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0], "latent_image": ["4", 0]}, "class_type": "KSampler"},
    "6": {"inputs": {"samples": ["5", 0], "vae": ["1", 2]}, "class_type": "VAEDecode"},
    "7": {"inputs": {"filename_prefix": "comfy_wrapper_", "images": ["6", 0]}, "class_type": "SaveImage"}
}

# Standard Basic Workflow (SD1.5 / SDXL)
BASIC_WORKFLOW = {
    "1": {"inputs": {"ckpt_name": "v1-5-pruned-emaonly.ckpt"}, "class_type": "CheckpointLoaderSimple"},
    "2": {"inputs": {"text": "(positive prompt)", "clip": ["1", 1]}, "class_type": "CLIPTextEncode"},
    "3": {"inputs": {"text": "(negative prompt)", "clip": ["1", 1]}, "class_type": "CLIPTextEncode"},
    "4": {"inputs": {"width": 512, "height": 512, "batch_size": 1}, "class_type": "EmptyLatentImage"},
    "5": {"inputs": {"seed": 0, "steps": 20, "cfg": 8.0, "sampler_name": "euler", "scheduler": "normal", "denoise": 1, "model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0], "latent_image": ["4", 0]}, "class_type": "KSampler"},
    "6": {"inputs": {"samples": ["5", 0], "vae": ["1", 2]}, "class_type": "VAEDecode"},
    "7": {"inputs": {"filename_prefix": "comfy_basic_", "images": ["6", 0]}, "class_type": "SaveImage"}
}

# Standard Flux Dev Workflow
# This is a simplified reliable flux workflow using CheckpointLoaderSimple if possible, 
# or standard components. Using CheckpointLoaderSimple is safest for generic Flux checkpoints.
# Note: Flux often requires specific KSampler logic (ModelSamplingFlux), but modern nodes handle it if checkpoint is loaded correctly.
# If user selects a checkpoint, we use CheckpointLoaderSimple.
FLUX_WORKFLOW = {
    "1": {"inputs": {"ckpt_name": "flux1-dev.safetensors"}, "class_type": "CheckpointLoaderSimple"},
    "2": {"inputs": {"text": "", "clip": ["1", 1]}, "class_type": "CLIPTextEncode"},
    "3": {"inputs": {"text": "low quality, blurry", "clip": ["1", 1]}, "class_type": "CLIPTextEncode"},
    "4": {"inputs": {"width": 1024, "height": 1024, "batch_size": 1}, "class_type": "EmptyLatentImage"},
    "5": {"inputs": {"seed": 0, "steps": 20, "cfg": 1.0, "sampler_name": "euler", "scheduler": "simple", "denoise": 1, "model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0], "latent_image": ["4", 0]}, "class_type": "KSampler"},
    "6": {"inputs": {"samples": ["5", 0], "vae": ["1", 2]}, "class_type": "VAEDecode"},
    "7": {"inputs": {"filename_prefix": "flux_wrapper_", "images": ["6", 0]}, "class_type": "SaveImage"}
}

def build_workflow(request: ImageGenerateRequest) -> Dict[str, Any]:
    """Build workflow from request."""
    import json
    
    # Select Base Workflow based on model name
    model_name = request.model or ""
    
    if "flux" in model_name.lower():
        base_workflow = FLUX_WORKFLOW
        workflow_type = "flux"
    elif "basic" in model_name.lower() or "v1-5" in model_name.lower():
        base_workflow = BASIC_WORKFLOW
        workflow_type = "basic"
    else:
        # Default: Turbo AIO workflow
        base_workflow = TURBO_AIO_WORKFLOW
        workflow_type = "turbo_aio"
    
    workflow = json.loads(json.dumps(base_workflow))
    
    # 1. Set Model (all types use CheckpointLoaderSimple at Node 1)
    if model_name:
        workflow["1"]["inputs"]["ckpt_name"] = model_name

    # 2. Set Prompt
    if workflow_type == "turbo_aio":
        # Turbo AIO: Node 2 = positive prompt (negative is ConditioningZeroOut)
        workflow["2"]["inputs"]["text"] = request.positive_prompt
    elif workflow_type in ["flux", "basic"]:
        workflow["2"]["inputs"]["text"] = request.positive_prompt
        workflow["3"]["inputs"]["text"] = request.negative_prompt

    # 3. Set Dimensions (Latent Image) and Batch Size
    workflow["4"]["inputs"]["width"] = request.width
    workflow["4"]["inputs"]["height"] = request.height
    workflow["4"]["inputs"]["batch_size"] = request.batch_size

    # 4. Set Sampler (Seed, Steps, CFG)
    sampler_node_id = "5"
    if sampler_node_id in workflow:
        workflow[sampler_node_id]["inputs"]["seed"] = random.randint(0, 2**53 - 1)
        workflow[sampler_node_id]["inputs"]["steps"] = request.steps
        workflow[sampler_node_id]["inputs"]["cfg"] = request.cfg
        workflow[sampler_node_id]["inputs"]["sampler_name"] = request.sampler_name

    # 5. Add LoRAs (chain from model Node 1)
    lora_list = request.lora_names or request.loras_names
    if lora_list:
        last_node_id = "1"
        for i, lora_name in enumerate(lora_list):
            node_id = str(100 + i)
            workflow[node_id] = {
                "inputs": {
                    "lora_name": lora_name,
                    "strength_model": 1.0,
                    "model": [last_node_id, 0]
                },
                "class_type": "LoraLoaderModelOnly"
            }
            last_node_id = node_id
        
        # Connect last LoRA output to KSampler (Node 5)
        if "5" in workflow and "inputs" in workflow["5"]:
            workflow["5"]["inputs"]["model"] = [last_node_id, 0]
    
    return workflow


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
        import logging
        logger = logging.getLogger(__name__)
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
    url = get_comfy_url(db)
    try:
        workflow = build_workflow(request)
        client_id = f"wrapper_{random.randint(0, 9999)}"
        
        async with httpx.AsyncClient(timeout=120.0, trust_env=False) as client:
            response = await client.post(
                f"{url}/prompt",
                json={"prompt": workflow, "client_id": client_id}
            )
            response.raise_for_status()
            result = response.json()
            
            return {
                "prompt_id": result["prompt_id"],
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
                        prompt_id=prompt_id,
                        status="processing",
                        ready=False
                    )
            
            for item in queue_data.get("queue_pending", []):
                if item[1] == prompt_id:
                    return ImageStatusResponse(
                        prompt_id=prompt_id,
                        status="pending",
                        ready=False
                    )
            
            # Check history
            history_response = await client.get(f"{url}/history/{prompt_id}")
            history_data = history_response.json()
            
            prompt_data = history_data.get(prompt_id)
            if not prompt_data:
                return ImageStatusResponse(
                    prompt_id=prompt_id,
                    status="not_found",
                    ready=False
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
            
            for node_id in ["7", "11", "10", "9"]:
                if node_id in outputs and "images" in outputs[node_id]:
                    for img in outputs[node_id]["images"]:
                        filename = img.get("filename", "")
                        subfolder = img.get("subfolder", "")
                        
                        filenames.append(filename)

                        if not first_filename:
                            first_filename = filename
                        
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
                subfolder=img.get("subfolder", "") if first_filename else "",
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
            # Check common loader nodes for model lists
            models = []
            # Check for Checkpoints (standard) and UNETs (diffusion_models)
            # User specifically requested unet/diffusion_models support
            
            # 1. Checkpoints
            if "CheckpointLoaderSimple" in data:
                inputs = data["CheckpointLoaderSimple"]["input"]["required"]
                if "ckpt_name" in inputs:
                    models.extend(inputs["ckpt_name"][0])

            # 2. UNETs / Diffusion Models
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
            # ComfyUI has a /free endpoint that clears memory
            await client.post(f"{url}/free", json={"unload_models": True, "free_memory": True})
            return {"status": "cleared", "message": "VRAM and RAM cleared"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

from fastapi import WebSocket, WebSocketDisconnect
from services.websocket_manager import get_manager

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time ComfyUI updates."""
    await websocket.accept()
    # Note: WS cannot easily get DB session via Depends. 
    # For now falling back to DEFAULT or we need to manage session manually.
    # To keep it simple, we use DEFAULT_COMFYUI_URL for WS for now, or fetch new one.
    manager = get_manager(DEFAULT_COMFYUI_URL)
    
    async def forward_message(message: Dict):
        try:
            await websocket.send_json(message)
        except Exception:
            pass # Handle disconnects gracefully

    try:
        await manager.add_client(forward_message)
        # Keep connection open
        while True:
            # Just keep the connection alive, maybe handle incoming pings if needed
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        await manager.remove_client(forward_message)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"WebSocket error: {e}")
        await manager.remove_client(forward_message)
