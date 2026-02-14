
import random
import json
from typing import Dict, Any
from schemas.comfy_schemas import ImageGenerateRequest

# Z-Image Turbo AIO Workflow (All-In-One checkpoint)
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
FLUX_WORKFLOW = {
    "1": {"inputs": {"ckpt_name": "flux1-dev.safetensors"}, "class_type": "CheckpointLoaderSimple"},
    "2": {"inputs": {"text": "", "clip": ["1", 1]}, "class_type": "CLIPTextEncode"},
    "3": {"inputs": {"text": "low quality, blurry", "clip": ["1", 1]}, "class_type": "CLIPTextEncode"},
    "4": {"inputs": {"width": 1024, "height": 1024, "batch_size": 1}, "class_type": "EmptyLatentImage"},
    "5": {"inputs": {"seed": 0, "steps": 20, "cfg": 1.0, "sampler_name": "euler", "scheduler": "simple", "denoise": 1, "model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0], "latent_image": ["4", 0]}, "class_type": "KSampler"},
    "6": {"inputs": {"samples": ["5", 0], "vae": ["1", 2]}, "class_type": "VAEDecode"},
    "7": {"inputs": {"filename_prefix": "flux_wrapper_", "images": ["6", 0]}, "class_type": "SaveImage"}
}

def build_comfy_workflow(request: ImageGenerateRequest) -> Dict[str, Any]:
    """Build the ComfyUI API JSON workflow from the user request."""
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
    
    # 1. Set Model
    if model_name:
        workflow["1"]["inputs"]["ckpt_name"] = model_name

    # 2. Set Prompt
    if workflow_type == "turbo_aio":
        workflow["2"]["inputs"]["text"] = request.positive_prompt
    elif workflow_type in ["flux", "basic"]:
        workflow["2"]["inputs"]["text"] = request.positive_prompt
        workflow["3"]["inputs"]["text"] = request.negative_prompt

    # 3. Set Dimensions and Batch Size
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
