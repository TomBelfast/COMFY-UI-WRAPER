import requests
import time
import json
import sys

BASE_URL = "http://localhost:8000"

TEST_CASES = [
    {"width": 1088, "height": 1920, "name": "9:16 Portrait"},
    {"width": 1280, "height": 1280, "name": "1:1 Square"},
    {"width": 1920, "height": 1088, "name": "16:9 Landscape"}
]

def generate_and_verify():
    failures = []
    generated_files = []

    print(f"🚀 Starting Aspect Ratio Test for {len(TEST_CASES)} cases...")

    for case in TEST_CASES:
        print(f"\nTesting {case['name']} ({case['width']}x{case['height']})...")
        
        # 1. Generate
        payload = {
            "positive_prompt": "A futuristic city with neons, cinematic lighting",
            "negative_prompt": "blurry, low quality",
            "width": case["width"],
            "height": case["height"],
            "steps": 10,
            "cfg": 1.0,
            "batch_size": 1
        }
        
        try:
            resp = requests.post(f"{BASE_URL}/api/comfy/generate", json=payload)
            if resp.status_code != 200:
                print(f"❌ Failed to queue: {resp.text}")
                failures.append(case)
                continue
            
            data = resp.json()
            prompt_id = data.get("prompt_id")
            if not prompt_id:
                print("❌ No prompt_id returned")
                failures.append(case)
                continue
                
            print(f"   Queued: {prompt_id}. Waiting for completion...")
            
            # 2. Poll for Status
            filename = None
            for _ in range(60): # Wait up to 60s
                time.sleep(1)
                status_resp = requests.get(f"{BASE_URL}/api/comfy/status/{prompt_id}")
                status_data = status_resp.json()
                
                if status_data["status"] == "completed":
                    filename = status_data.get("filename")
                    print(f"   ✅ Completed! Filename: {filename}")
                    break
                elif status_data["status"] == "failed":
                    print("   ❌ Generation Failed")
                    break
            
            if not filename:
                print("   ❌ Timeout or Failure waiting for completion")
                failures.append(case)
                continue

            # 3. Simulate Frontend Save to Gallery
            gallery_payload = {
                "filename": filename,
                "subfolder": "",
                "prompt_positive": payload["positive_prompt"],
                "prompt_negative": payload["negative_prompt"],
                "model": "turbo-aio",
                "width": case["width"],
                "height": case["height"],
                "steps": payload["steps"],
                "cfg": payload["cfg"]
            }
            
            gal_resp = requests.post(f"{BASE_URL}/api/gallery", json=gallery_payload)
            if gal_resp.status_code == 200:
                print("   ✅ Saved to Gallery")
                generated_files.append({"filename": filename, "width": case["width"], "height": case["height"]})
            else:
                print(f"   ❌ Failed to save to gallery: {gal_resp.text}")
                failures.append(case)

        except Exception as e:
            print(f"   ❌ Exception: {e}")
            failures.append(case)

    # 4. Verify Gallery Contents
    print("\n🔎 Verifying Gallery Persistence...")
    try:
        gallery_resp = requests.get(f"{BASE_URL}/api/gallery")
        gallery_items = gallery_resp.json()
        
        print(f"   Gallery has {len(gallery_items)} items.")
        
        all_found = True
        for gen in generated_files:
            found = False
            for item in gallery_items:
                if item["filename"] == gen["filename"]:
                    found = True
                    # Check dims
                    if item["width"] == gen["width"] and item["height"] == gen["height"]:
                        print(f"   ✅ Found {gen['filename']} with correct dims ({gen['width']}x{gen['height']})")
                    else:
                        print(f"   ⚠️ Found {gen['filename']} but dims mismatch: {item['width']}x{item['height']} vs {gen['width']}x{gen['height']}")
                        failures.append({"name": f"Dim Mismatch {gen['filename']}"})
                    break
            if not found:
                print(f"   ❌ Could not find {gen['filename']} in gallery response")
                all_found = False
                failures.append({"name": f"Missing {gen['filename']}"})
                
        if all_found and not failures:
            print("\n✨ ALL TESTS PASSED! ✨")
            sys.exit(0)
        else:
            print(f"\n💀 TESTS FAILED: {len(failures)} failures")
            sys.exit(1)

    except Exception as e:
        print(f"❌ Gallery Verification Exception: {e}")
        sys.exit(1)

if __name__ == "__main__":
    generate_and_verify()
