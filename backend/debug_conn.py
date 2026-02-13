
import asyncio
import httpx
import sys

async def check_connection(url):
    print(f"Testing connection to {url}...")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{url}/system_stats")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:100]}...")
            return True
    except Exception as e:
        print(f"ERROR connecting to {url}: {type(e).__name__}: {e}")
        return False

async def main():
    urls = [
        "http://127.0.0.1:8188",
        "http://localhost:8188",
        "http://192.168.0.14:8188"
    ]
    
    results = []
    for url in urls:
        results.append(await check_connection(url))
    
    if any(results):
        print("SUCCESS: At least one connection worked.")
        sys.exit(0)
    else:
        print("FAILURE: All connections failed.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
