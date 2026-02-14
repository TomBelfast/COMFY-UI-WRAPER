
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

# Z-Turbo Upscale Workflow (SeedVR2 Integrated) - 100% MATCH TO JSON
UPSCALE_WORKFLOW = {
  "48": {
    "inputs": {
      "ckpt_name": "z-image-turbo-bf16-aio.safetensors"
    },
    "class_type": "CheckpointLoaderSimple"
  },
  "49": {
    "inputs": {
      "conditioning": [
        "54",
        0
      ]
    },
    "class_type": "ConditioningZeroOut"
  },
  "50": {
    "inputs": {
      "samples": [
        "52",
        0
      ],
      "vae": [
        "48",
        2
      ]
    },
    "class_type": "VAEDecode"
  },
  "52": {
    "inputs": {
      "seed": 2025,
      "steps": 8,
      "cfg": 1,
      "sampler_name": "res_multistep",
      "scheduler": "simple",
      "denoise": 1,
      "model": [
        "48",
        0
      ],
      "positive": [
        "54",
        0
      ],
      "negative": [
        "49",
        0
      ],
      "latent_image": [
        "55",
        0
      ]
    },
    "class_type": "KSampler"
  },
  "53": {
    "inputs": {
      "filename_prefix": "z-image/a",
      "images": [
        "50",
        0
      ]
    },
    "class_type": "SaveImage"
  },
  "54": {
    "inputs": {
      "text": "",
      "clip": [
        "48",
        1
      ]
    },
    "class_type": "CLIPTextEncode"
  },
  "55": {
    "inputs": {
      "width": 1088,
      "height": 1920,
      "batch_size": 1
    },
    "class_type": "EmptySD3LatentImage"
  },
  "60": {
    "inputs": {
      "model": "seedvr2_ema_7b_sharp_fp16.safetensors",
      "device": "cuda:0",
      "blocks_to_swap": 36,
      "swap_io_components": False,
      "offload_device": "cpu",
      "cache_model": False,
      "attention_mode": "sdpa"
    },
    "class_type": "SeedVR2LoadDiTModel"
  },
  "61": {
    "inputs": {
      "model": "ema_vae_fp16.safetensors",
      "device": "cuda:0",
      "encode_tiled": True,
      "encode_tile_size": 1024,
      "encode_tile_overlap": 128,
      "decode_tiled": True,
      "decode_tile_size": 1024,
      "decode_tile_overlap": 128,
      "tile_debug": "false",
      "offload_device": "cpu",
      "cache_model": False
    },
    "class_type": "SeedVR2LoadVAEModel"
  },
  "62": {
    "inputs": {
      "seed": 2026,
      "resolution": 4096,
      "max_resolution": 4096,
      "batch_size": 1,
      "uniform_batch_size": False,
      "color_correction": "lab",
      "temporal_overlap": 0,
      "prepend_frames": 0,
      "input_noise_scale": 0,
      "latent_noise_scale": 0,
      "offload_device": "cpu",
      "enable_debug": False,
      "image": [
        "50",
        0
      ],
      "dit": [
        "60",
        0
      ],
      "vae": [
        "61",
        0
      ]
    },
    "class_type": "SeedVR2VideoUpscaler"
  },
  "64": {
    "inputs": {
      "filename_prefix": "z-image/b",
      "images": [
        "62",
        0
      ]
    },
    "class_type": "SaveImage"
  },
  "66": {
    "inputs": {
      "rgthree_comparer": {
        "images": [
          {
            "name": "A",
            "selected": True,
            "url": ""
          },
          {
            "name": "B",
            "selected": True,
            "url": ""
          }
        ]
      },
      "image_a": [
        "50",
        0
      ],
      "image_b": [
        "62",
        0
      ]
    },
    "class_type": "Image Comparer (rgthree)"
  }
}

def build_comfy_workflow(request: ImageGenerateRequest) -> Dict[str, Any]:
    """Build the ComfyUI API JSON workflow from the user request."""
    workflow_id = request.workflow_id
    model_name = request.model or ""
    
    if workflow_id == "upscale":
        base_workflow = UPSCALE_WORKFLOW
        workflow_type = "upscale"
    elif "flux" in model_name.lower():
        base_workflow = FLUX_WORKFLOW
        workflow_type = "flux"
    elif "basic" in model_name.lower() or "v1-5" in model_name.lower():
        base_workflow = BASIC_WORKFLOW
        workflow_type = "basic"
    else:
        base_workflow = TURBO_AIO_WORKFLOW
        workflow_type = "turbo_aio"
    
    workflow = json.loads(json.dumps(base_workflow))
    
    # 1. SPECIAL CASE: UPSCALE (SeedVR2 Nodes)
    if workflow_type == "upscale":
        # Node 48: Checkpoint
        if model_name: workflow["48"]["inputs"]["ckpt_name"] = model_name
        # Node 54: Prompt
        workflow["54"]["inputs"]["text"] = request.positive_prompt
        # Node 55: Dimensions
        workflow["55"]["inputs"]["width"] = request.width
        workflow["55"]["inputs"]["height"] = request.height
        # Node 52: KSampler
        seed_val = random.randint(0, 2**32 - 1)
        workflow["52"]["inputs"]["seed"] = seed_val
        workflow["52"]["inputs"]["steps"] = request.steps
        workflow["52"]["inputs"]["cfg"] = request.cfg
        workflow["52"]["inputs"]["sampler_name"] = request.sampler_name
        workflow["52"]["inputs"]["scheduler"] = "simple"
        workflow["52"]["inputs"]["denoise"] = 1
        
        # Node 62: Upscaler Seed
        workflow["62"]["inputs"]["seed"] = random.randint(0, 2**32 - 1)
        
        print(f"DEBUG: Generated UPSCALE workflow with seed {seed_val}")
        return workflow

    # --- STANDARD MAPPING FOR OTHER WORKFLOWS ---
    # 1. Set Model
    if "1" in workflow and model_name:
        workflow["1"]["inputs"]["ckpt_name"] = model_name

    # 2. Set Prompt
    if "2" in workflow:
        workflow["2"]["inputs"]["text"] = request.positive_prompt
    if "3" in workflow:
        workflow["3"]["inputs"]["text"] = request.negative_prompt or "low quality, blurry"

    # 3. Set Dimensions and Batch Size
    if "4" in workflow and "width" in workflow["4"]["inputs"]:
        workflow["4"]["inputs"]["width"] = request.width
    if "6" in workflow and "width" in workflow["6"]["inputs"]: 
        workflow["6"]["inputs"]["width"] = request.width
        workflow["6"]["inputs"]["height"] = request.height

    # 4. Set Sampler (Seed, Steps, CFG)
    sampler_node_id = "5"
    if sampler_node_id in workflow:
        workflow[sampler_node_id]["inputs"]["seed"] = random.randint(0, 2**32 - 1)
        workflow[sampler_node_id]["inputs"]["steps"] = request.steps
        workflow[sampler_node_id]["inputs"]["cfg"] = request.cfg
        workflow[sampler_node_id]["inputs"]["sampler_name"] = request.sampler_name

    # 5. Add LoRAs
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
        
        if "5" in workflow and "inputs" in workflow["5"]:
            workflow["5"]["inputs"]["model"] = [last_node_id, 0]
    
    return workflow
