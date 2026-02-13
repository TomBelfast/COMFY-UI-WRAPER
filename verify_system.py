
import sys
import os

# Ensure we can import backend modules (which assume they are in PYTHONPATH or CWD)
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

from fastapi.testclient import TestClient

# Import directly from main (which is in backend/)
try:
    from backend.main import app
except ImportError:
    # Fallback if namespacing is weird
    import main
    app = main.app

client = TestClient(app)

def test_health():
    print("Testing /api/health...")
    response = client.get("/api/health")
    if response.status_code != 200:
        print(f"FAILED: Health check returned {response.status_code}")
        return False
    print("PASSED")
    return True

def test_gallery_crud():
    print("Testing Gallery CRUD...")
    # 1. Create
    data = {
        "filename": "verify_test.png",
        "subfolder": "tests",
        "prompt_positive": "Unit Test Image",
        "model": "verify_model_v1",
        "width": 1024,
        "height": 1024,
        "steps": 1,
        "cfg": 1.0
    }
    res_create = client.post("/api/gallery/", json=data)
    if res_create.status_code != 200:
        print(f"FAILED: Create gallery item ({res_create.status_code}) - {res_create.text}")
        return False

    item = res_create.json()
    item_id = item["id"]
    print(f"Created item ID: {item_id}")

    # 2. List
    res_list = client.get("/api/gallery/")
    items = res_list.json()
    if not any(i["id"] == item_id for i in items):
        print("FAILED: Item not found in list")
        return False
    
    # 3. Delete
    res_delete = client.delete(f"/api/gallery/{item_id}")
    if res_delete.status_code != 200:
        print(f"FAILED: Delete returned {res_delete.status_code}")
        return False
    
    print("PASSED")
    return True

if __name__ == "__main__":
    print("=== STARTING SYSTEM VERIFICATION (Backend) ===")
    h = test_health()
    g = test_gallery_crud()
    
    if h and g:
        print("\n>>> ALL BACKEND TESTS PASSED <<<")
        sys.exit(0)
    else:
        print("\n>>> SOME TESTS FAILED <<<")
        sys.exit(1)
