import os
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv

# Load .env file if available
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "").strip()
NVIDIA_NIM_BASE_URL = os.getenv("NVIDIA_NIM_BASE_URL", "https://integrate.api.nvidia.com/v1").strip()

NVIDIA_ASR_ENDPOINT = os.getenv("NVIDIA_ASR_ENDPOINT", "nvidia/parakeet-ctc-1.1b").strip()
NVIDIA_VLM_ENDPOINT = os.getenv("NVIDIA_VLM_ENDPOINT", "meta/llama-3.2-11b-vision-instruct").strip()
NVIDIA_EMBEDDING_ENDPOINT = os.getenv("NVIDIA_EMBEDDING_ENDPOINT", "nvidia/nv-embedqa-e5-v5").strip()
NVIDIA_RERANKER_ENDPOINT = os.getenv("NVIDIA_RERANKER_ENDPOINT", "nvidia/nv-rerankqa-mistral-4b-v3").strip()

LANCEDB_PATH = os.getenv("LANCEDB_PATH", "storage/lancedb").strip()
USE_MOCK_FALLBACK = os.getenv("USE_MOCK_FALLBACK", "true").lower() in ("true", "1", "yes")

def get_lancedb_full_path() -> Path:
    p = Path(LANCEDB_PATH)
    if not p.is_absolute():
        p = BASE_DIR / p
    p.mkdir(parents=True, exist_ok=True)
    return p

def get_ai_status() -> Dict[str, Any]:
    has_key = bool(NVIDIA_API_KEY)
    return {
        "nvidia_configured": has_key,
        "nvidia_api_key_present": has_key,
        "nvidia_nim_base_url": NVIDIA_NIM_BASE_URL,
        "endpoints": {
            "asr": NVIDIA_ASR_ENDPOINT,
            "vlm": NVIDIA_VLM_ENDPOINT,
            "embedding": NVIDIA_EMBEDDING_ENDPOINT,
            "reranker": NVIDIA_RERANKER_ENDPOINT,
        },
        "lancedb_path": str(get_lancedb_full_path()),
        "use_mock_fallback": USE_MOCK_FALLBACK,
        "active_mode": "nvidia_nim" if has_key else ("mock_fallback" if USE_MOCK_FALLBACK else "unconfigured")
    }
