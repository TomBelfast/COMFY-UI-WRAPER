"""
E2E tests for aspect ratio generation and gallery refresh.

Tests cover:
1. Workflow builder correctly applies different aspect ratios
2. Gallery CRUD with dimension persistence
3. Gallery refresh returns correct aspect ratio data
4. Full flow: generate request -> save to gallery -> verify dimensions
"""
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import Base, get_db, GalleryImage


# --- Test DB setup (isolated SQLite in-memory) ---

TEST_DATABASE_URL = "sqlite:///./test_e2e.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_teardown_db():
    """Create tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    # Patch SessionLocal in websocket_manager so _auto_save_images uses test DB
    with patch("services.websocket_manager.SessionLocal", TestingSessionLocal):
        yield
    Base.metadata.drop_all(bind=engine)


# --- Aspect Ratio Test Cases ---

ASPECT_RATIOS = [
    {"name": "9:16 Portrait", "width": 1088, "height": 1920},
    {"name": "1:1 Square", "width": 1280, "height": 1280},
    {"name": "16:9 Landscape", "width": 1920, "height": 1088},
    {"name": "3:4 Portrait", "width": 768, "height": 1024},
    {"name": "4:3 Landscape", "width": 1024, "height": 768},
]


# ============================================================
# 1. Workflow Builder - Aspect Ratio Tests
# ============================================================

class TestWorkflowBuilderAspectRatio:
    """Test that build_workflow correctly applies dimensions."""

    @pytest.mark.parametrize("ratio", ASPECT_RATIOS, ids=[r["name"] for r in ASPECT_RATIOS])
    def test_workflow_dimensions_set_correctly(self, ratio):
        """Verify width/height are injected into the workflow latent image node."""
        from routes.comfy import build_workflow, ImageGenerateRequest

        request = ImageGenerateRequest(
            positive_prompt="test prompt",
            negative_prompt="bad quality",
            width=ratio["width"],
            height=ratio["height"],
            steps=8,
            cfg=1.0,
        )
        workflow = build_workflow(request)

        # Node "4" is the latent image node in all workflow types
        assert workflow["4"]["inputs"]["width"] == ratio["width"]
        assert workflow["4"]["inputs"]["height"] == ratio["height"]

    @pytest.mark.parametrize("ratio", ASPECT_RATIOS, ids=[r["name"] for r in ASPECT_RATIOS])
    def test_workflow_dimensions_turbo_aio(self, ratio):
        """Verify turbo AIO workflow uses correct dimensions."""
        from routes.comfy import build_workflow, ImageGenerateRequest

        request = ImageGenerateRequest(
            positive_prompt="cinematic city",
            width=ratio["width"],
            height=ratio["height"],
            model="z-image-turbo-bf16-aio.safetensors",
        )
        workflow = build_workflow(request)

        assert workflow["4"]["class_type"] == "EmptySD3LatentImage"
        assert workflow["4"]["inputs"]["width"] == ratio["width"]
        assert workflow["4"]["inputs"]["height"] == ratio["height"]

    @pytest.mark.parametrize("ratio", ASPECT_RATIOS, ids=[r["name"] for r in ASPECT_RATIOS])
    def test_workflow_dimensions_flux(self, ratio):
        """Verify flux workflow uses correct dimensions."""
        from routes.comfy import build_workflow, ImageGenerateRequest

        request = ImageGenerateRequest(
            positive_prompt="test",
            width=ratio["width"],
            height=ratio["height"],
            model="flux1-dev.safetensors",
        )
        workflow = build_workflow(request)

        assert workflow["4"]["class_type"] == "EmptyLatentImage"
        assert workflow["4"]["inputs"]["width"] == ratio["width"]
        assert workflow["4"]["inputs"]["height"] == ratio["height"]

    @pytest.mark.parametrize("ratio", ASPECT_RATIOS, ids=[r["name"] for r in ASPECT_RATIOS])
    def test_workflow_dimensions_basic(self, ratio):
        """Verify basic workflow uses correct dimensions."""
        from routes.comfy import build_workflow, ImageGenerateRequest

        request = ImageGenerateRequest(
            positive_prompt="test",
            width=ratio["width"],
            height=ratio["height"],
            model="v1-5-pruned-emaonly.ckpt",
        )
        workflow = build_workflow(request)

        assert workflow["4"]["class_type"] == "EmptyLatentImage"
        assert workflow["4"]["inputs"]["width"] == ratio["width"]
        assert workflow["4"]["inputs"]["height"] == ratio["height"]

    def test_default_dimensions(self):
        """Verify default dimensions when none specified."""
        from routes.comfy import build_workflow, ImageGenerateRequest

        request = ImageGenerateRequest(positive_prompt="test")
        workflow = build_workflow(request)

        assert workflow["4"]["inputs"]["width"] == 1088
        assert workflow["4"]["inputs"]["height"] == 1920


# ============================================================
# 2. Gallery CRUD with Aspect Ratio Persistence
# ============================================================

class TestGalleryCRUD:
    """Test gallery API stores and retrieves dimensions correctly."""

    def _make_gallery_item(self, width=1088, height=1920, filename="test_img.png"):
        return {
            "filename": filename,
            "subfolder": "",
            "prompt_positive": "A futuristic city with neons",
            "prompt_negative": "blurry, low quality",
            "model": "turbo-aio",
            "width": width,
            "height": height,
            "steps": 10,
            "cfg": 1.0,
        }

    @pytest.mark.parametrize("ratio", ASPECT_RATIOS, ids=[r["name"] for r in ASPECT_RATIOS])
    def test_save_and_retrieve_aspect_ratio(self, ratio):
        """Save image with specific dimensions, verify they persist in gallery."""
        item = self._make_gallery_item(
            width=ratio["width"],
            height=ratio["height"],
            filename=f"test_{ratio['name'].replace(' ', '_')}.png",
        )

        # Save
        resp = client.post("/api/gallery", json=item)
        assert resp.status_code == 200
        saved = resp.json()
        assert saved["width"] == ratio["width"]
        assert saved["height"] == ratio["height"]

        # Retrieve
        resp = client.get("/api/gallery")
        assert resp.status_code == 200
        gallery = resp.json()
        assert len(gallery) == 1
        assert gallery[0]["width"] == ratio["width"]
        assert gallery[0]["height"] == ratio["height"]
        assert gallery[0]["filename"] == item["filename"]

    def test_gallery_multiple_aspect_ratios(self):
        """Save multiple images with different aspect ratios, verify all persist."""
        for i, ratio in enumerate(ASPECT_RATIOS):
            item = self._make_gallery_item(
                width=ratio["width"],
                height=ratio["height"],
                filename=f"multi_{i}.png",
            )
            resp = client.post("/api/gallery", json=item)
            assert resp.status_code == 200

        # Retrieve all
        resp = client.get("/api/gallery")
        assert resp.status_code == 200
        gallery = resp.json()
        assert len(gallery) == len(ASPECT_RATIOS)

        # Gallery returns newest first, so reverse to match insertion order
        gallery_reversed = list(reversed(gallery))
        for i, ratio in enumerate(ASPECT_RATIOS):
            assert gallery_reversed[i]["width"] == ratio["width"]
            assert gallery_reversed[i]["height"] == ratio["height"]

    def test_gallery_delete_preserves_others(self):
        """Delete one image, verify others retain correct dimensions."""
        # Add two images
        item1 = self._make_gallery_item(width=1088, height=1920, filename="keep.png")
        item2 = self._make_gallery_item(width=1280, height=1280, filename="delete.png")

        resp1 = client.post("/api/gallery", json=item1)
        resp2 = client.post("/api/gallery", json=item2)
        delete_id = resp2.json()["id"]

        # Delete second
        resp = client.delete(f"/api/gallery/{delete_id}")
        assert resp.status_code == 200

        # Verify first remains with correct dims
        gallery = client.get("/api/gallery").json()
        assert len(gallery) == 1
        assert gallery[0]["width"] == 1088
        assert gallery[0]["height"] == 1920

    def test_gallery_clear_all(self):
        """Clear gallery, verify empty."""
        for ratio in ASPECT_RATIOS[:3]:
            item = self._make_gallery_item(width=ratio["width"], height=ratio["height"])
            client.post("/api/gallery", json=item)

        resp = client.delete("/api/gallery")
        assert resp.status_code == 200

        gallery = client.get("/api/gallery").json()
        assert len(gallery) == 0


# ============================================================
# 3. Gallery Refresh - Simulated E2E Flow
# ============================================================

class TestGalleryRefreshE2E:
    """Simulate the full frontend flow: generate -> save -> refresh gallery."""

    def _make_gallery_item(self, width, height, filename):
        return {
            "filename": filename,
            "subfolder": "",
            "prompt_positive": "A futuristic city with neons, cinematic lighting",
            "prompt_negative": "blurry, low quality",
            "model": "turbo-aio",
            "width": width,
            "height": height,
            "steps": 10,
            "cfg": 1.0,
        }

    def test_full_e2e_aspect_ratio_flow(self):
        """
        Simulate full E2E flow for all aspect ratios:
        1. Build workflow (verify dimensions)
        2. Save to gallery (simulate post-generation save)
        3. Refresh gallery (verify all items with correct dims)
        """
        from routes.comfy import build_workflow, ImageGenerateRequest

        saved_items = []

        for i, ratio in enumerate(ASPECT_RATIOS):
            # Step 1: Verify workflow builder
            request = ImageGenerateRequest(
                positive_prompt="cinematic city",
                width=ratio["width"],
                height=ratio["height"],
            )
            workflow = build_workflow(request)
            assert workflow["4"]["inputs"]["width"] == ratio["width"]
            assert workflow["4"]["inputs"]["height"] == ratio["height"]

            # Step 2: Save to gallery (simulating what frontend does after generation)
            filename = f"comfy_wrapper_{i:05d}_.png"
            item = self._make_gallery_item(ratio["width"], ratio["height"], filename)
            resp = client.post("/api/gallery", json=item)
            assert resp.status_code == 200
            saved = resp.json()
            saved_items.append(saved)

        # Step 3: Refresh gallery (what frontend does on refreshTrigger change)
        resp = client.get("/api/gallery")
        assert resp.status_code == 200
        gallery = resp.json()

        assert len(gallery) == len(ASPECT_RATIOS)

        # Verify each saved item appears with correct dimensions
        for saved in saved_items:
            match = next(
                (g for g in gallery if g["filename"] == saved["filename"]),
                None,
            )
            assert match is not None, f"Missing {saved['filename']} in gallery"
            assert match["width"] == saved["width"]
            assert match["height"] == saved["height"]
            assert match["id"] == saved["id"]

    def test_gallery_refresh_ordering(self):
        """Verify gallery returns newest first (as frontend expects)."""
        for i in range(3):
            item = self._make_gallery_item(
                width=1024 + i * 100,
                height=768 + i * 100,
                filename=f"order_test_{i}.png",
            )
            client.post("/api/gallery", json=item)

        gallery = client.get("/api/gallery").json()
        assert len(gallery) == 3

        # Newest first = last inserted should be first
        assert gallery[0]["filename"] == "order_test_2.png"
        assert gallery[0]["width"] == 1224
        assert gallery[2]["filename"] == "order_test_0.png"
        assert gallery[2]["width"] == 1024

    def test_gallery_refresh_after_delete(self):
        """Verify gallery refresh after deletion returns correct remaining items."""
        items = []
        for i, ratio in enumerate(ASPECT_RATIOS[:3]):
            item = self._make_gallery_item(
                ratio["width"], ratio["height"], f"del_test_{i}.png"
            )
            resp = client.post("/api/gallery", json=item)
            items.append(resp.json())

        # Delete the middle one
        client.delete(f"/api/gallery/{items[1]['id']}")

        # Refresh
        gallery = client.get("/api/gallery").json()
        assert len(gallery) == 2

        filenames = [g["filename"] for g in gallery]
        assert "del_test_1.png" not in filenames
        assert "del_test_0.png" in filenames
        assert "del_test_2.png" in filenames

        # Verify dimensions of remaining items
        for g in gallery:
            if g["filename"] == "del_test_0.png":
                assert g["width"] == ASPECT_RATIOS[0]["width"]
                assert g["height"] == ASPECT_RATIOS[0]["height"]
            elif g["filename"] == "del_test_2.png":
                assert g["width"] == ASPECT_RATIOS[2]["width"]
                assert g["height"] == ASPECT_RATIOS[2]["height"]

    def test_gallery_limit_parameter(self):
        """Verify gallery respects limit parameter."""
        for i in range(5):
            item = self._make_gallery_item(1024, 1024, f"limit_test_{i}.png")
            client.post("/api/gallery", json=item)

        gallery = client.get("/api/gallery?limit=2").json()
        assert len(gallery) == 2
        # Should be newest 2
        assert gallery[0]["filename"] == "limit_test_4.png"
        assert gallery[1]["filename"] == "limit_test_3.png"


# ============================================================
# 4. Edge Cases
# ============================================================

class TestAspectRatioEdgeCases:
    """Edge cases for aspect ratio handling."""

    def test_very_large_dimensions(self):
        """Test with large dimensions (4K)."""
        item = {
            "filename": "4k_test.png",
            "subfolder": "",
            "prompt_positive": "test",
            "prompt_negative": "",
            "model": "test",
            "width": 3840,
            "height": 2160,
            "steps": 10,
            "cfg": 1.0,
        }
        resp = client.post("/api/gallery", json=item)
        assert resp.status_code == 200
        assert resp.json()["width"] == 3840
        assert resp.json()["height"] == 2160

    def test_small_dimensions(self):
        """Test with small dimensions (thumbnails)."""
        item = {
            "filename": "small_test.png",
            "subfolder": "",
            "prompt_positive": "test",
            "prompt_negative": "",
            "model": "test",
            "width": 256,
            "height": 256,
            "steps": 10,
            "cfg": 1.0,
        }
        resp = client.post("/api/gallery", json=item)
        assert resp.status_code == 200
        assert resp.json()["width"] == 256
        assert resp.json()["height"] == 256

    def test_non_standard_aspect_ratio(self):
        """Test with non-standard dimensions."""
        item = {
            "filename": "odd_test.png",
            "subfolder": "",
            "prompt_positive": "test",
            "prompt_negative": "",
            "model": "test",
            "width": 1337,
            "height": 999,
            "steps": 10,
            "cfg": 1.0,
        }
        resp = client.post("/api/gallery", json=item)
        assert resp.status_code == 200
        saved = resp.json()
        assert saved["width"] == 1337
        assert saved["height"] == 999

        gallery = client.get("/api/gallery").json()
        assert gallery[0]["width"] == 1337
        assert gallery[0]["height"] == 999

    def test_workflow_batch_size_with_aspect_ratio(self):
        """Verify batch_size doesn't affect aspect ratio in workflow."""
        from routes.comfy import build_workflow, ImageGenerateRequest

        request = ImageGenerateRequest(
            positive_prompt="test",
            width=1920,
            height=1088,
            batch_size=4,
        )
        workflow = build_workflow(request)
        assert workflow["4"]["inputs"]["width"] == 1920
        assert workflow["4"]["inputs"]["height"] == 1088
        assert workflow["4"]["inputs"]["batch_size"] == 4


# ============================================================
# 5. WebSocket Auto-Save Flow (the real bug area)
# ============================================================

class TestAutoSaveFlow:
    """Test the _auto_save_images method handles ComfyUI output correctly."""

    def _setup_manager(self):
        from services.websocket_manager import ComfyWebSocketManager
        manager = ComfyWebSocketManager("http://fake:8188")
        return manager

    @pytest.mark.asyncio
    async def test_auto_save_flat_output_format(self):
        """
        ComfyUI 'executed' event sends flat: {"images": [{filename, subfolder, type}]}.
        This is the REAL format from ComfyUI and must work.
        """
        manager = self._setup_manager()

        prompt_id = "test-flat-001"
        manager.register_metadata(prompt_id, {
            "prompt_positive": "a futuristic city",
            "prompt_negative": "blurry",
            "model": "turbo-aio",
            "width": 1088,
            "height": 1920,
            "steps": 10,
            "cfg": 1.0,
        })

        # This is what ComfyUI actually sends in the executed event
        flat_output = {
            "images": [
                {"filename": "comfy_wrapper_00001_.png", "subfolder": "", "type": "output"}
            ]
        }

        await manager._auto_save_images(prompt_id, flat_output)

        # Verify saved to DB
        db = TestingSessionLocal()
        try:
            images = db.query(GalleryImage).all()
            assert len(images) == 1
            assert images[0].filename == "comfy_wrapper_00001_.png"
            assert images[0].width == 1088
            assert images[0].height == 1920
            assert images[0].prompt_positive == "a futuristic city"
        finally:
            db.close()

    @pytest.mark.asyncio
    async def test_auto_save_nested_output_format(self):
        """
        Test with nested format: {"node_id": {"images": [...]}}.
        Backwards compatibility.
        """
        manager = self._setup_manager()

        prompt_id = "test-nested-001"
        manager.register_metadata(prompt_id, {
            "prompt_positive": "landscape",
            "prompt_negative": "",
            "model": "flux",
            "width": 1920,
            "height": 1088,
            "steps": 20,
            "cfg": 1.0,
        })

        nested_output = {
            "7": {
                "images": [
                    {"filename": "flux_wrapper_00001_.png", "subfolder": "", "type": "output"}
                ]
            }
        }

        await manager._auto_save_images(prompt_id, nested_output)

        db = TestingSessionLocal()
        try:
            images = db.query(GalleryImage).all()
            assert len(images) == 1
            assert images[0].filename == "flux_wrapper_00001_.png"
            assert images[0].width == 1920
            assert images[0].height == 1088
        finally:
            db.close()

    @pytest.mark.asyncio
    async def test_auto_save_batch_multiple_images(self):
        """Test auto-save with batch_size > 1 (multiple images in one execution)."""
        manager = self._setup_manager()

        prompt_id = "test-batch-001"
        manager.register_metadata(prompt_id, {
            "prompt_positive": "batch test",
            "prompt_negative": "",
            "model": "turbo",
            "width": 1280,
            "height": 1280,
            "steps": 8,
            "cfg": 1.0,
        })

        batch_output = {
            "images": [
                {"filename": "comfy_wrapper_00001_.png", "subfolder": "", "type": "output"},
                {"filename": "comfy_wrapper_00002_.png", "subfolder": "", "type": "output"},
                {"filename": "comfy_wrapper_00003_.png", "subfolder": "", "type": "output"},
            ]
        }

        await manager._auto_save_images(prompt_id, batch_output)

        db = TestingSessionLocal()
        try:
            images = db.query(GalleryImage).all()
            assert len(images) == 3
            for img in images:
                assert img.width == 1280
                assert img.height == 1280
        finally:
            db.close()

    @pytest.mark.asyncio
    async def test_auto_save_triggers_gallery_refresh(self):
        """Verify auto-save broadcasts gallery_updated event."""
        manager = self._setup_manager()
        broadcast_messages = []

        async def capture_broadcast(msg):
            broadcast_messages.append(msg)

        await manager.add_client(capture_broadcast)

        prompt_id = "test-broadcast-001"
        manager.register_metadata(prompt_id, {
            "prompt_positive": "test",
            "prompt_negative": "",
            "model": "test",
            "width": 1024,
            "height": 1024,
            "steps": 10,
            "cfg": 1.0,
        })

        output = {"images": [{"filename": "test.png", "subfolder": "", "type": "output"}]}
        await manager._auto_save_images(prompt_id, output)

        # Should have broadcast gallery_updated
        gallery_msgs = [m for m in broadcast_messages if m.get("type") == "gallery_updated"]
        assert len(gallery_msgs) == 1
        assert gallery_msgs[0]["data"]["prompt_id"] == prompt_id
        assert gallery_msgs[0]["data"]["count"] == 1

    @pytest.mark.asyncio
    async def test_auto_save_no_metadata_does_nothing(self):
        """If no metadata cached, auto-save should not crash or save."""
        manager = self._setup_manager()

        output = {"images": [{"filename": "orphan.png", "subfolder": "", "type": "output"}]}
        await manager._auto_save_images("unknown-prompt", output)

        db = TestingSessionLocal()
        try:
            images = db.query(GalleryImage).all()
            assert len(images) == 0
        finally:
            db.close()

    @pytest.mark.asyncio
    async def test_auto_save_preserves_aspect_ratio_per_prompt(self):
        """
        Full E2E: register metadata for different aspect ratios,
        auto-save each, verify gallery has correct dimensions.
        """
        manager = self._setup_manager()

        test_cases = [
            {"prompt_id": "ar-portrait", "width": 1088, "height": 1920, "filename": "portrait.png"},
            {"prompt_id": "ar-square", "width": 1280, "height": 1280, "filename": "square.png"},
            {"prompt_id": "ar-landscape", "width": 1920, "height": 1088, "filename": "landscape.png"},
        ]

        for tc in test_cases:
            manager.register_metadata(tc["prompt_id"], {
                "prompt_positive": f"test {tc['prompt_id']}",
                "prompt_negative": "",
                "model": "test",
                "width": tc["width"],
                "height": tc["height"],
                "steps": 10,
                "cfg": 1.0,
            })
            output = {"images": [{"filename": tc["filename"], "subfolder": "", "type": "output"}]}
            await manager._auto_save_images(tc["prompt_id"], output)

        # Verify via gallery API
        resp = client.get("/api/gallery")
        assert resp.status_code == 200
        gallery = resp.json()
        assert len(gallery) == 3

        for tc in test_cases:
            match = next((g for g in gallery if g["filename"] == tc["filename"]), None)
            assert match is not None, f"Missing {tc['filename']}"
            assert match["width"] == tc["width"], f"{tc['filename']}: width {match['width']} != {tc['width']}"
            assert match["height"] == tc["height"], f"{tc['filename']}: height {match['height']} != {tc['height']}"
