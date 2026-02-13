
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_websocket_connection():
    """Test connecting to the backend WebSocket endpoint."""
    print("\n[TEST] Testing WebSocket connection...")
    with client.websocket_connect("/api/comfy/ws") as websocket:
        # If we connect without error, that's a pass
        assert websocket
        # Can also send a ping/pong if implemented
        websocket.send_text("ping")
        data = websocket.receive_text()
        assert data == "pong"
        print("[PASS] WebSocket connected and responded to ping.")
