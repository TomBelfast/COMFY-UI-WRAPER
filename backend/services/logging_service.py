import logging
import sys
from loguru import logger
from typing import Set
import asyncio

class InterceptHandler(logging.Handler):
    def emit(self, record):
        # Get corresponding Loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller from where originated the logged message
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())

class LogStreamManager:
    def __init__(self):
        self.active_connections: Set[asyncio.Queue] = set()
        self.loop = None

    def setup_logging(self):
        # Remove default handlers
        logging.root.handlers = []
        
        # Intercept everything at the root level
        logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
        
        # Configure loguru
        logger.remove()
        logger.add(sys.stderr, level="DEBUG")
        logger.add(self.log_sink, level="DEBUG")

    def log_sink(self, message):
        # This can be called from any thread
        record = message.record
        log_entry = {
            "timestamp": record["time"].isoformat(),
            "level": record["level"].name,
            "message": record["message"],
            "module": record["module"],
            "function": record["function"],
            "line": record["line"]
        }
        
        if self.loop and self.loop.is_running():
            for queue in self.active_connections:
                self.loop.call_soon_threadsafe(queue.put_nowait, log_entry)

    async def subscribe(self):
        # Save loop on first subscription if not already set
        if not self.loop:
            self.loop = asyncio.get_running_loop()
            
        queue = asyncio.Queue()
        self.active_connections.add(queue)
        try:
            while True:
                yield await queue.get()
        finally:
            self.active_connections.remove(queue)

log_manager = LogStreamManager()
