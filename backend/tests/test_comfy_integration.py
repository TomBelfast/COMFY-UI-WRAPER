
import pytest
from fastapi.testclient import TestClient
from main import app
import logging
import json

# Initialize client
client = TestClient(app)

# Validation constants (adjust based on your actual ComfyUI setup if needed)
EXPECTED_MODEL_EXTENSION = ".safetensors"

def test_health_check_real_connection():
    """
    Test connection to the real ComfyUI instance.
    Requires ComfyUI to be running at the configured URL.
    """
    print("\n[TEST] Checking ComfyUI health...")
    response = client.get("/api/comfy/health")
    
    # Print response for verbose debugging
    print(f"[DEBUG] Health Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify we are actually connected
    if data["status"] != "connected":
        pytest.fail(f"ComfyUI is not connected! Status: {data.get('status')} - Check if server is running at {data.get('comfyui_url')}")
        
    assert "devices" in data
    assert len(data["devices"]) > 0
    print(f"[PASS] Connected to ComfyUI. Devices found: {len(data['devices'])}")


def test_get_available_models_real():
    """
    Test retrieving real models from ComfyUI.
    """
    print("\n[TEST] Fetching available models...")
    response = client.get("/api/comfy/models")
    
    print(f"[DEBUG] Models Response Status: {response.status_code}")
    
    assert response.status_code == 200
    data = response.json()
    
    # Strict error check
    if "error" in data:
        pytest.fail(f"API returned error: {data['error']}")
    
    # Should include both checkpoints and unets
    assert "models" in data
    models = data["models"]
    
    # We expect at least some models to be present in a working setup
    if not models:
        pytest.warns(UserWarning, match="No models found in ComfyUI")
    else:
        print(f"[DEBUG] Found {len(models)} models. First 5: {models[:5]}")
        
    # Validation: Check if we are getting model filenames
    assert isinstance(models, list)
    if models:
        assert isinstance(models[0], str)


def test_get_available_loras_real():
    """
    Test retrieving real LoRAs from ComfyUI.
    """
    print("\n[TEST] Fetching available LoRAs...")
    response = client.get("/api/comfy/loras")
    
    assert response.status_code == 200
    data = response.json()
    
    if "error" in data:
        pytest.fail(f"API returned error: {data['error']}")
    
    assert "loras" in data
    loras = data["loras"]
    
    if not loras:
        print("[WARN] No LoRAs found. This might be normal if none are installed.")
    else:
        print(f"[DEBUG] Found {len(loras)} LoRAs. First 5: {loras[:5]}")
        
    assert isinstance(loras, list)


def test_generate_image_submission_real():
    """
    Test submitting a real generation request.
    Note: This sends a real job to the GPU queue.
    """
    print("\n[TEST] Submitting generation job...")
    
    payload = {
        "positive_prompt": "A futuristic city with neon lights, cinematic lighting, 8k",
        "negative_prompt": "blurry, low quality, text, watermark",
        "width": 1024,
        "height": 768,
        "steps": 10,  # Keep steps low for faster test
        "cfg": 7.0
    }
    
    response = client.post("/api/comfy/generate", json=payload)
    
    print(f"[DEBUG] Generate Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code != 200:
        pytest.fail(f"Generation failed: {response.text}")
        
    data = response.json()
    
    assert data["status"] == "queued"
    assert "prompt_id" in data
    assert data["message"] == "Generation started"
    
    prompt_id = data["prompt_id"]
    print(f"[PASS] Job queued successfully. Prompt ID: {prompt_id}")
    
    # Optional: We could check status immediately
    status_response = client.get(f"/api/comfy/status/{prompt_id}")
    status_data = status_response.json()
    print(f"[DEBUG] Initial Status: {status_data['status']}")
    assert status_response.status_code == 200
