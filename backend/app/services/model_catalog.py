from typing import List, Dict, Any

RECOMMENDED_MODELS: List[Dict[str, Any]] = [
    {"name": "llama3.2:1b", "label": "Llama 3.2 (1B)", "size": "~0.6GB", "description": "Fast and efficient, great for general tasks"},
    {"name": "qwen2.5:0.5b", "label": "Qwen 2.5 (0.5B)", "size": "~0.4GB", "description": "Smallest option, fastest inference"},
    {"name": "gemma3:1b", "label": "Gemma 3 (1B)", "size": "~0.7GB", "description": "Google's efficient model"},
    {"name": "phi3:mini", "label": "Phi-3 Mini (3.8B)", "size": "~2.3GB", "description": "Microsoft's capable small model"},
    {"name": "tinyllama:latest", "label": "TinyLlama (1.1B)", "size": "~0.6GB", "description": "Ultra-lightweight, very fast"},
    {"name": "llama3.2:3b", "label": "Llama 3.2 (3B)", "size": "~1.8GB", "description": "Better quality, still small"},
    {"name": "qwen2.5:1.5b", "label": "Qwen 2.5 (1.5B)", "size": "~1GB", "description": "Good balance of speed and quality"},
]


def get_model_catalog() -> List[Dict[str, Any]]:
    """Return the full model catalog."""
    return RECOMMENDED_MODELS


def find_model(model_name: str) -> Dict[str, Any] | None:
    """Find a model in the catalog by name."""
    for model in RECOMMENDED_MODELS:
        if model["name"] == model_name:
            return model
    return None