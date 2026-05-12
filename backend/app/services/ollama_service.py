from typing import List, Optional, Dict, Any
import httpx
from app.core.config import settings


class OllamaService:
    """Wrapper around Ollama REST API."""

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.OLLAMA_BASE_URL
        self.timeout = httpx.Timeout(300.0, connect=30.0)
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "ngrok-skip-browser-warning": "true",
            "Bypass-Tunnel-Reminder": "true",
            "Content-Type": "application/json"
        }

    async def check_health(self) -> bool:
        """Check if Ollama server is reachable."""
        async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers) as client:
            try:
                response = await client.get(f"{self.base_url}/")
                return response.status_code == 200
            except Exception:
                return False

    async def list_models(self) -> List[Dict[str, Any]]:
        """List available models from Ollama."""
        async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers) as client:
            try:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                data = response.json()
                return [
                    {"name": m["name"], "size": m.get("size", 0), "modified_at": m.get("modified_at")}
                    for m in data.get("models", [])
                ]
            except Exception as e:
                raise Exception(f"Failed to list models: {str(e)}")

    async def pull_model(self, model_name: str) -> Dict[str, Any]:
        """Pull a model from Ollama registry."""
        async with httpx.AsyncClient(timeout=httpx.Timeout(600.0, connect=30.0), headers=self.headers) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/api/pull",
                    json={"name": model_name, "stream": False}
                )
                response.raise_for_status()
                return {"status": "success", "model": model_name}
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    raise Exception(f"Model '{model_name}' not found in Ollama registry")
                raise Exception(f"Failed to pull model: {str(e)}")
            except Exception as e:
                raise Exception(f"Failed to pull model: {str(e)}")

    async def chat_completion(
        self,
        model: str,
        messages: List[Dict[str, str]]
    ) -> str:
        """Send chat completion request to Ollama."""
        async with httpx.AsyncClient(timeout=httpx.Timeout(180.0, connect=30.0), headers=self.headers) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": model,
                        "messages": messages,
                        "stream": False
                    }
                )
                response.raise_for_status()
                data = response.json()
                return data["message"]["content"]
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    raise Exception(f"Model '{model}' not found. Please pull it first.")
                raise Exception(f"Ollama API error: {str(e)}")
            except Exception as e:
                raise Exception(f"Failed to get chat response: {str(e)}")

    def update_base_url(self, new_url: str):
        """Update the base URL at runtime."""
        self.base_url = new_url


ollama_service = OllamaService()