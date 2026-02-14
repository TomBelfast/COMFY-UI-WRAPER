
from typing import Optional, List
from pydantic import BaseModel, Field

class ImageGenerateRequest(BaseModel):
    """Request to generate an image."""
    positive_prompt: str
    negative_prompt: str = "blurry, low quality, text, watermark"
    width: int = 1088
    height: int = 1920
    model: Optional[str] = None
    loras_names: Optional[List[str]] = None
    lora_names: Optional[List[str]] = None  # Backwards compatibility
    steps: int = 8
    cfg: float = 1.0
    sampler_name: str = "res_multistep"
    batch_size: int = 1
    workflow_id: str = "default"

class ImageStatusResponse(BaseModel):
    """Response with generation status."""
    prompt_id: str
    status: str
    ready: bool
    filename: Optional[str] = None
    filenames: List[str] = Field(default_factory=list)
    subfolder: Optional[str] = None
    image_url: Optional[str] = None
    image_urls: List[str] = Field(default_factory=list)
