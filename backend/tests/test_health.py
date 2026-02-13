"""
Test suite for backend health check.
Phase 1 verification.
"""
import pytest
from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


def test_health_check():
    """Verify health endpoint returns OK."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "comfyui-wrapper" in data["service"]


def test_root():
    """Verify root endpoint returns message."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "ComfyUI Wrapper" in data["message"]
