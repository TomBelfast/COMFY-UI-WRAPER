
import requests
import time
import json

BASE_URL = "http://localhost:8000"
USERNAME = "tomaszpasiekauk@gmail.com"
PASSWORD = "Tomasz2024!"

def test_flow():
    # 1. Login
    print(f"Logging in as {USERNAME}...")
    login_resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": USERNAME, "password": PASSWORD}
    )
    if login_resp.status_code != 200:
        print(f"Login failed: {login_resp.text}")
        return
    
    token = login_resp.json()["token"]
    user_id = login_resp.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Login successful. User ID: {user_id}")

    # 2. Generate
    payload = {
        "positive_prompt": "a beautiful cinematic landscape, mountains, sunset, highly detailed",
        "negative_prompt": "blurry, low quality, distorted",
        "width": 1024,
        "height": 1024,
        "model": "z-image-turbo-bf16-aio.safetensors",
        "workflow_id": "turbo-gen",
        "steps": 8,
        "cfg": 1.0,
        "sampler_name": "res_multistep",
        "batch_size": 1
    }
    
    print("Submitting generation request...")
    gen_resp = requests.post(
        f"{BASE_URL}/api/comfy/generate",
        json=payload,
        headers=headers
    )
    
    if gen_resp.status_code != 200:
        print(f"Generation failed: {gen_resp.text}")
        return
    
    prompt_id = gen_resp.json()["prompt_id"]
    print(f"Generation queued. Prompt ID: {prompt_id}")

    # 3. Poll status
    print("Polling status...")
    for _ in range(30): # 30 seconds timeout
        status_resp = requests.get(
            f"{BASE_URL}/api/comfy/status/{prompt_id}",
            headers=headers
        )
        status_data = status_resp.json()
        status = status_data.get("status")
        print(f"Current status: {status}")
        
        if status == "completed":
            print("Generation completed!")
            print(f"Results: {json.dumps(status_data, indent=2)}")
            break
        elif status == "failed":
            print("Generation failed in ComfyUI.")
            break
        
        time.sleep(2)
    else:
        print("Timeout waiting for generation.")

    # 4. Final verify in DB
    print("\nVerifying gallery entry in DB...")
    import sqlite3
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, filename, prompt_positive FROM gallery WHERE prompt_id = ? AND user_id = ?", (prompt_id, user_id))
    row = cursor.fetchone()
    if row:
        print(f"SUCCESS: Image found in gallery (ID: {row[0]}, File: {row[1]})")
    else:
        print("FAILURE: Image NOT found in gallery DB.")
    conn.close()

if __name__ == "__main__":
    test_flow()
