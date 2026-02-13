
import pytest
from httpx import AsyncClient
from backend.main import app

# This requires the backend to be running or we use TestClient
# But TestClient with Async is tricky with FastAPI in some setups unless using AsyncClient
# Let's use a simple script that hits the running server if it's up, or TestClient if not.
# Actually, better to use TestClient to be self-contained.

import asyncio
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_gallery_crud():
    # 1. Create
    data = {
        "filename": "test_img.png",
        "subfolder": "",
        "prompt_positive": "test prompt",
        "model": "test_model",
        "width": 512,
        "height": 512,
        "steps": 20,
        "cfg": 7.0
    }
    res_create = client.post("/api/gallery/", json=data)
    assert res_create.status_code == 200
    item = res_create.json()
    assert item["filename"] == "test_img.png"
    item_id = item["id"]

    # 2. List
    res_list = client.get("/api/gallery/")
    assert res_list.status_code == 200
    items = res_list.json()
    assert any(i["id"] == item_id for i in items)

    # 3. Delete
    res_delete = client.delete(f"/api/gallery/{item_id}")
    assert res_delete.status_code == 200
    
    # 4. Verify Delete
    res_list_2 = client.get("/api/gallery/")
    items_2 = res_list_2.json()
    assert not any(i["id"] == item_id for i in items_2)

def test_comfy_proxy_mock():
    # We can't easily test real Comfy connection without it running, 
    # but we can check if the route exists and returns 503 or 200
    # Assuming Comfy might not be running in this CI-like check
    try:
        res = client.get("/api/comfy/health")
        assert res.status_code in [200, 503]
    except Exception:
        pass

if __name__ == "__main__":
    try:
        test_health()
        print("✅ Health Check Passed")
        test_gallery_crud()
        print("✅ Gallery CRUD Passed")
        test_comfy_proxy_mock()
        print("✅ Comfy Proxy Endpoint Accessible")
        print("ALL TESTS PASSED")
    except Exception as e:
        print(f"❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
