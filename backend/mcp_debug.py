import sys
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("DebugDashboard")

@mcp.tool()
def get_backend_status():
    """Get the current status of the FastAPI backend."""
    import requests
    try:
        response = requests.get("http://localhost:8000/health", timeout=2)
        return response.json()
    except Exception as e:
        return f"Backend is offline or unreachable: {e}"

if __name__ == "__main__":
    mcp.run()
