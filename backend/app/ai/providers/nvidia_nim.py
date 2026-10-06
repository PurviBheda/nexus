import httpx
from typing import Dict, Any, List, Optional
from app.ai.config import NVIDIA_API_KEY, NVIDIA_NIM_BASE_URL, NVIDIA_VLM_ENDPOINT, NVIDIA_ASR_ENDPOINT

class NVIDIANIMClient:
    """
    Client for interacting with NVIDIA hosted NIM services / endpoints.
    Follows official NVIDIA NIM OpenAI-compatible API specifications.
    """
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout_seconds: float = 30.0
    ):
        self.api_key = api_key or NVIDIA_API_KEY
        self.base_url = (base_url or NVIDIA_NIM_BASE_URL).rstrip("/")
        self.timeout = timeout_seconds

    def is_available(self) -> bool:
        return bool(self.api_key)

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    def chat_completion(
        self,
        model: str,
        messages: List[Dict[str, Any]],
        max_tokens: int = 1024,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        """
        Calls NVIDIA NIM chat completions endpoint (standard OpenAI spec compatible).
        """
        if not self.is_available():
            raise ValueError("NVIDIA_API_KEY is not configured.")

        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }

        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(url, json=payload, headers=self._get_headers())
            if response.status_code != 200:
                raise RuntimeError(
                    f"NVIDIA NIM API request failed ({response.status_code}): {response.text}"
                )
            return response.json()

    def generate_embeddings(
        self,
        model: str,
        input_texts: List[str],
        input_type: str = "passage"
    ) -> List[List[float]]:
        """
        Calls NVIDIA NeMo Retriever / Embedding NIM endpoint.
        """
        if not self.is_available():
            raise ValueError("NVIDIA_API_KEY is not configured.")

        url = f"{self.base_url}/embeddings"
        payload = {
            "model": model,
            "input": input_texts,
            "input_type": input_type,
            "encoding_format": "float"
        }

        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(url, json=payload, headers=self._get_headers())
            if response.status_code != 200:
                raise RuntimeError(
                    f"NVIDIA Embedding API request failed ({response.status_code}): {response.text}"
                )
            data = response.json()
            embeddings = [item["embedding"] for item in data.get("data", [])]
            return embeddings
