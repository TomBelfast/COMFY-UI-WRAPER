
import sys
import os
import json
from unittest.mock import MagicMock

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Mock database imports to avoid needing real DB
sys.modules['database'] = MagicMock()
sys.modules['sqlalchemy.orm'] = MagicMock()

# Mock FastAPI
fastapi_mock = MagicMock()
fastapi_mock.responses = MagicMock()
sys.modules['fastapi'] = fastapi_mock
sys.modules['fastapi.responses'] = fastapi_mock.responses
sys.modules['pydantic'] = MagicMock()

# Import the logic we want to test
# We need to manually define the request class since we mocked pydantic
class ImageGenerateRequest:
    def __init__(self, model, positive_prompt="test", width=1024, height=1024, steps=20, cfg=1.0, lora_names=[]):
        self.model = model
        self.positive_prompt = positive_prompt
        self.negative_prompt = "neg"
        self.width = width
        self.height = height
        self.steps = steps
        self.cfg = cfg
        self.lora_names = lora_names
        self.loras_names = lora_names

# Copy-paste the build_workflow function or import it if possible. 
# Importing is hard because of dependencies. 
# Let's import the module but mock the heavy stuff.
# actually, better to just test the live file if imports allow.
# Import block removed to prevent overwriting local class
pass

def test_workflow_switching():
    print("Testing Z-Image Workflow...")
    req_z = ImageGenerateRequest(positive_prompt="Aura", model="zImageTurboFP8.safetensors")
    wf_z = build_workflow(req_z)
    
    # Check if UNETLoader is used (Z-Image uses Node 1 as UNETLoader)
    node1_class = wf_z["1"]["class_type"]
    print(f"Node 1 Class: {node1_class}")
    if node1_class != "UNETLoader":
        print("FAIL: Expected UNETLoader for Z-Image")
    else:
        print("PASS: Z-Image selected")

    print("\nTesting Flux Workflow...")
    req_flux = ImageGenerateRequest(positive_prompt="Flux", model="flux1-dev.safetensors")
    wf_flux = build_workflow(req_flux)
    
    # Check if CheckpointLoaderSimple is used (Flux uses Node 1 as CheckpointLoaderSimple)
    # Check logic: if "flux" in model_name -> Flux Workflow
    node1_class_flux = wf_flux["1"]["class_type"]
    print(f"Node 1 Class: {node1_class_flux}")
    if node1_class_flux != "CheckpointLoaderSimple":
        print("FAIL: Expected CheckpointLoaderSimple for Flux")
    else:
        print("PASS: Flux selected")

if __name__ == "__main__":
    try:
        from backend.routes.comfy import build_workflow
        # Do NOT import ImageGenerateRequest, use the local mock class
        test_workflow_switching()
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Test Environment Error: {e}")
