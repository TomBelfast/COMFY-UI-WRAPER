import asyncio
import json
from loguru import logger
import websockets
from typing import Dict, Set, Optional, Any, Callable
from database import SessionLocal, GalleryImage

class ComfyWebSocketManager:
    def __init__(self, comfy_url: str):
        self.comfy_ws_url = comfy_url.replace("http://", "ws://").replace("https://", "wss://") + "/ws"
        self.base_url = comfy_url
        self.client_id = "comfy_wrapper_service"
        self.ws_connection = None
        self.connected_clients: Set[Callable[[Dict], Any]] = set()
        self.is_running = False
        self.last_message = {}
        self.metadata_cache: Dict[str, Dict] = {} # prompt_id -> metadata
        self.reconnect_delay = 5 # seconds
        self.ping_interval = 30 # seconds (User requested 30s)
        self.ping_timeout = 30

    async def connect(self):
        """Infinite loop to maintain connection to ComfyUI WS."""
        if self.is_running:
            logger.warning("ComfyUI WS connection loop is already running.")
            return
            
        self.is_running = True
        full_url = f"{self.comfy_ws_url}?clientId={self.client_id}"
        
        while self.is_running:
            logger.info(f"Connecting to ComfyUI WS: {full_url}")
            try:
                async with websockets.connect(
                    full_url, 
                    ping_interval=self.ping_interval, 
                    ping_timeout=self.ping_timeout
                ) as ws:
                    self.ws_connection = ws
                    logger.success(f"Connected to ComfyUI WebSocket (Ping: {self.ping_interval}s)")
                    await self._listen()
            except Exception as e:
                logger.error(f"ComfyUI WS connection error: {e}. Retrying in {self.reconnect_delay}s...")
                await asyncio.sleep(self.reconnect_delay)
            finally:
                self.ws_connection = None

    def register_metadata(self, prompt_id: str, metadata: Dict):
        """Register metadata for a prompt to be saved automatically upon completion."""
        logger.info(f"METADATA: Registering metadata for PROMPT_ID: {prompt_id}")
        self.metadata_cache[prompt_id] = metadata
        logger.debug(f"METADATA: Current cache size: {len(self.metadata_cache)}")

    async def _listen(self):
        """Listen for messages from ComfyUI and stream them to logs."""
        if not self.ws_connection:
            return

        try:
            async for message in self.ws_connection:
                try:
                    # ComfyUI sends both JSON and binary (for previews)
                    if isinstance(message, str):
                        data = json.loads(message)
                        self.last_message = data
                        
                        # Process event for logging
                        event_type = data.get("type", "unknown")
                        payload = data.get("data", {})
                        
                        if event_type == "status":
                            # Only log queue changes to avoid spam
                            # queue_remaining = payload.get("status", {}).get("exec_info", {}).get("queue_remaining", 0)
                            pass
                        elif event_type == "execution_start":
                            pid = payload.get('prompt_id')
                            logger.info(f"ComfyUI: Starting execution for prompt {pid} (In cache: {pid in self.metadata_cache})")
                        elif event_type == "executing":
                            node = payload.get("node")
                            prompt_id = payload.get("prompt_id")
                            if not node and prompt_id and prompt_id in self.metadata_cache:
                                logger.success(f"ComfyUI: Execution finished for prompt {prompt_id}")
                                # Cleanup cache ONLY when the entire prompt is done
                                del self.metadata_cache[prompt_id]
                        elif event_type == "progress":
                            # Skip heavy progress logging unless needed
                            pass
                        elif event_type == "executed":
                            # This is the gold mine for auto-save
                            prompt_id = payload.get("prompt_id")
                            node_id = payload.get("node")
                            output = payload.get("output", {})
                            logger.info(f"ComfyUI: Executed Node {node_id} for prompt {prompt_id}")
                            
                            if prompt_id in self.metadata_cache:
                                await self._auto_save_images(prompt_id, output)
                            else:
                                logger.warning(f"ComfyUI: Executed event for prompt {prompt_id} but no metadata in cache!")
                        
                        await self._broadcast(data)
                except json.JSONDecodeError:
                    pass
                except Exception as e:
                    logger.error(f"Error processing WS message: {e}")
                    
        except websockets.exceptions.ConnectionClosed:
            logger.warning("ComfyUI WebSocket connection closed remotely")
        except Exception as e:
            logger.error(f"Error in WS listener loop: {e}")

    async def _auto_save_images(self, prompt_id: str, output: Dict):
        """Automatically save generated images to DB."""
        metadata = self.metadata_cache.get(prompt_id)
        if not metadata:
            return

        # 1. Collect image lists from output FIRST
        image_lists = []
        if "images" in output and isinstance(output["images"], list):
            image_lists.append(output["images"])
        else:
            for node_id, node_output in output.items():
                if isinstance(node_output, dict) and "images" in node_output:
                    image_lists.append(node_output["images"])

        if not image_lists:
            return

        db = None
        saved_count = 0
        try:
            db = SessionLocal()
            for images in image_lists:
                for img in images:
                    filename = img.get("filename")
                    subfolder = img.get("subfolder", "")

                    if filename:
                        # Read actual image dimensions from ComfyUI
                        actual_width = metadata.get("width", 1024)
                        actual_height = metadata.get("height", 1024)
                        try:
                            import httpx
                            from PIL import Image
                            import io
                            view_url = f"{self.base_url}/view?filename={filename}&subfolder={subfolder}&type=output"
                            async with httpx.AsyncClient(timeout=10.0, trust_env=False) as http_client:
                                resp = await http_client.get(view_url)
                                if resp.status_code == 200:
                                    pil_img = Image.open(io.BytesIO(resp.content))
                                    actual_width = pil_img.size[0]
                                    actual_height = pil_img.size[1]
                                    logger.debug(f"AUTO-SAVE: Real dimensions for {filename}: {actual_width}x{actual_height}")
                        except Exception as dim_err:
                            logger.warning(f"AUTO-SAVE: Could not read dimensions for {filename}: {dim_err}")

                        db_image = GalleryImage(
                            prompt_id=prompt_id,
                            filename=filename,
                            subfolder=subfolder,
                            workflow_id=metadata.get("workflow_id", "default"),
                            prompt_positive=metadata.get("prompt_positive", ""),
                            prompt_negative=metadata.get("prompt_negative", ""),
                            model=metadata.get("model", ""),
                            width=actual_width,
                            height=actual_height,
                            steps=metadata.get("steps", 20),
                            cfg=metadata.get("cfg", 1.0)
                        )
                        db.add(db_image)
                        saved_count += 1

            if saved_count > 0:
                db.commit()
                logger.success(f"AUTO-SAVE: Successfully saved {saved_count} images for prompt {prompt_id} to DB")
                # Broadcast gallery update event
                update_msg = {
                    "type": "gallery_updated", 
                    "data": {
                        "prompt_id": prompt_id, 
                        "count": saved_count,
                        "workflow_id": metadata.get("workflow_id", "default")
                    }
                }
                logger.debug(f"BROADCAST: Sending gallery_updated signal: {update_msg}")
                await self._broadcast(update_msg)
            else:
                logger.warning(f"AUTO-SAVE: No images found in output for prompt {prompt_id}. Output keys: {list(output.keys())}")


        except Exception as e:
            logger.error(f"Failed to auto-save images for prompt {prompt_id}: {e}")
        finally:
            if db:
                db.close()

    async def disconnect(self):
        """Stop reconnect loop and close connection."""
        self.is_running = False
        if self.ws_connection:
            await self.ws_connection.close()

    async def add_client(self, client_callback: Callable[[Dict], Any]):
        """Add a client callback to receive updates."""
        self.connected_clients.add(client_callback)

    async def remove_client(self, client_callback: Callable[[Dict], Any]):
        """Remove a client callback."""
        self.connected_clients.discard(client_callback)

    async def _broadcast(self, message: Dict):
        """Broadcast message to all connected internal clients."""
        for client in self.connected_clients:
            try:
                if asyncio.iscoroutinefunction(client):
                    await client(message)
                else:
                    client(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")

# Global manager dictionary: url -> manager
managers: Dict[str, ComfyWebSocketManager] = {}

def get_manager(base_url: str) -> ComfyWebSocketManager:
    if base_url not in managers:
        managers[base_url] = ComfyWebSocketManager(base_url)
    
    # Only start connection if not already running
    manager = managers[base_url]
    if not manager.is_running:
        try:
            loop = asyncio.get_running_loop()
            if loop.is_running():
                logger.info(f"Auto-starting WS connection for {base_url}")
                loop.create_task(manager.connect())
        except RuntimeError:
            pass # Will be started manually or on first loop
            
    return manager
