
import asyncio
import json
import logging
import websockets
from typing import Dict, Set, Optional, Any, Callable

logger = logging.getLogger(__name__)

class ComfyWebSocketManager:
    def __init__(self, comfy_url: str):
        self.comfy_ws_url = comfy_url.replace("http://", "ws://").replace("https://", "wss://") + "/ws"
        self.client_id = "comfy_wrapper_service"
        self.ws_connection = None
        self.connected_clients: Set[Callable[[Dict], Any]] = set()
        self.is_running = False
        self.last_message = {}

    async def connect(self):
        """Establish connection to ComfyUI WebSocket."""
        full_url = f"{self.comfy_ws_url}?clientId={self.client_id}"
        logger.info(f"Connecting to ComfyUI WS: {full_url}")
        try:
            self.ws_connection = await websockets.connect(full_url)
            self.is_running = True
            logger.info("Connected to ComfyUI WebSocket")
            asyncio.create_task(self._listen())
        except Exception as e:
            logger.error(f"Failed to connect to ComfyUI WS: {e}")
            self.is_running = False

    async def _listen(self):
        """Listen for messages from ComfyUI."""
        if not self.ws_connection:
            return

        try:
            async for message in self.ws_connection:
                try:
                    data = json.loads(message)
                    self.last_message = data
                    await self._broadcast(data)
                except json.JSONDecodeError:
                    pass
        except websockets.exceptions.ConnectionClosed:
            logger.warning("ComfyUI WebSocket connection closed")
            self.is_running = False
            # Simple reconnection logic could go here
        except Exception as e:
            logger.error(f"Error in WS listener: {e}")
            self.is_running = False

    async def disconnect(self):
        """Close connection."""
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

# Global instance
manager: Optional[ComfyWebSocketManager] = None

def get_manager(base_url: str) -> ComfyWebSocketManager:
    global manager
    if manager is None:
        manager = ComfyWebSocketManager(base_url)
    return manager
