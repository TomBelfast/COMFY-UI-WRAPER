# ComfyUI Documentation

This document contains information retrieved via Context7 about ComfyUI API workflow format and Custom Node development.

## 1. ComfyUI API Workflow Format

The ComfyUI API uses a JSON format to define workflows. Unlike the UI's graph format, the API format is a flat dictionary of nodes, keyed by their ID.

### Structure

The core of a workflow submission to the `/prompt` endpoint is a JSON object where keys are node IDs (strings) and values are objects defining the node.

Each node object has:
- `inputs`: A dictionary mapping input names to values.
  - Primitive values (int, float, string) are passed directly.
  - Connection to another node is represented as an array: `["node_id", output_index]`.
- `class_type`: The string identifier for the node class (e.g., "KSampler", "CheckpointLoaderSimple").
- `_meta`: (Optional) Metadata used by the UI, often containing title.

### Example API JSON

```json
{
  "3": {
    "inputs": {
      "seed": 156680208700286,
      "steps": 20,
      "cfg": 8,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1,
      "model": ["4", 0],
      "positive": ["6", 0],
      "negative": ["7", 0],
      "latent_image": ["5", 0]
    },
    "class_type": "KSampler",
    "_meta": {
      "title": "KSampler"
    }
  },
  "4": {
    "inputs": {
      "ckpt_name": "v1-5-pruned-emaonly.ckpt"
    },
    "class_type": "CheckpointLoaderSimple",
    "_meta": {
      "title": "Load Checkpoint"
    }
  },
  "5": {
    "inputs": {
      "width": 512,
      "height": 512,
      "batch_size": 1
    },
    "class_type": "EmptyLatentImage",
    "_meta": {
      "title": "Empty Latent Image"
    }
  },
  "6": {
    "inputs": {
      "text": "beautiful scenery nature glass bottle landscape, purple galaxy bottle,",
      "clip": ["4", 1]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "CLIP Text Encode (Prompt)"
    }
  },
  "7": {
    "inputs": {
      "text": "text, watermark",
      "clip": ["4", 1]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "CLIP Text Encode (Negative Prompt)"
    }
  },
  "8": {
    "inputs": {
      "samples": ["3", 0],
      "vae": ["4", 2]
    },
    "class_type": "VAEDecode",
    "_meta": {
      "title": "VAE Decode"
    }
  },
  "9": {
    "inputs": {
      "filename_prefix": "ComfyUI",
      "images": ["8", 0]
    },
    "class_type": "SaveImage",
    "_meta": {
      "title": "Save Image"
    }
  }
}
```

### Key Differences from UI Format
- The UI saves workflows (often `workflow.json`) with extra layout information (positions, groups).
- The API expects the `prompt` format (often `api_format.json` when saved from UI with "Save (API Format)" option enabled in settings).
- Connection logic is strictly `["node_id", output_slot_index]`.

## 2. Custom Node Development

Custom nodes extend ComfyUI's functionality. They are Python classes placed in the `custom_nodes` directory.

### Basic Structure

A custom node is a Python class with specific attributes and methods:

1.  **`INPUT_TYPES` (classmethod)**: Defines input parameters.
    -   Returns a dictionary with `required`, `optional`, and `hidden` keys.
    -   Values define type (e.g., `("IMAGE",)`, `("INT", {"default": 1})`).
2.  **`RETURN_TYPES`**: Tuple of output types (e.g., `("IMAGE", "MASK")`).
3.  **`RETURN_NAMES`**: (Optional) Names for output slots.
4.  **`FUNCTION`**: Name of the method to execute.
5.  **`CATEGORY`**: Category in the node menu.
6.  **Processing Method**: The actual logic, matching `FUNCTION` name.

### Example Custom Node

```python
class ExampleNode:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "image": ("IMAGE",),
                "int_field": ("INT", {
                    "default": 0, 
                    "min": 0, 
                    "max": 4096, 
                    "step": 64,
                    "display": "number" 
                }),
            },
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image_output",)

    FUNCTION = "test_function"

    CATEGORY = "Example"

    def test_function(self, image, int_field):
        # Process image here
        return (image,)

# Node Mapping
NODE_CLASS_MAPPINGS = {
    "ExampleNode": ExampleNode
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "ExampleNode": "My Example Node"
}
```

### Type Definitions
- **Standard Types**: `IMAGE`, `LATENT`, `MASK`, `MODEL`, `VAE`, `CLIP`, `CONDITIONING`.
- **Primitives**: `INT`, `FLOAT`, `STRING`, `BOOLEAN`.
- **Custom Types**: Any string can maximize compatibility if agreed upon by nodes.

### Important Considerations
- **Execution**: ComfyUI executes nodes based on dependency flow.
- **Caching**: Inputs are hashed; if inputs don't change, the node might not re-run (unless `IS_CHANGED` method is defined).
- **GPU/CPU**: Ensure tensors are moved to the correct device.

## 3. WebSocket Communication

ComfyUI provides a WebSocket endpoint (`/ws`) for real-time status updates.

### Message Types
- `status`: periodically sends queue status.
- `execution_start`: when a prompt starts executing.
- `executing`: when a specific node starts.
- `execution_cached`: when a node result is retrieved from cache.
- `progress`: progress of the current step (KSampler).
- `execution_success`: workflow finished successfully.
- `execution_error`: workflow failed.

This allows the frontend to display progress bars the currently active node.
