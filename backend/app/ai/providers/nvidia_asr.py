import os
import json
import httpx
from typing import List, Dict, Any, Optional
from app.ai.config import NVIDIA_API_KEY, NVIDIA_NIM_BASE_URL, NVIDIA_ASR_ENDPOINT
from app.ai.providers.base import BaseAudioProcessor

class NVIDIAASRProvider(BaseAudioProcessor):
    """
    NVIDIA Speech / ASR Integration Provider using NVIDIA Riva ASR / NIM API.
    Converts audio into timestamped transcript segments.
    """
    def __init__(self, api_key: Optional[str] = None, endpoint: Optional[str] = None):
        self.api_key = api_key or NVIDIA_API_KEY
        self.endpoint = endpoint or NVIDIA_ASR_ENDPOINT
        self.base_url = NVIDIA_NIM_BASE_URL

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def transcribe_audio(
        self, file_path: str, source_file: str, case_id: str
    ) -> List[Dict[str, Any]]:
        """
        Transcribes audio using NVIDIA ASR API.
        If credentials or endpoint are missing, raises RuntimeError to allow graceful fallback/handling.
        """
        if not self.is_configured():
            raise RuntimeError("NVIDIA ASR API key is not configured.")

        # Real NVIDIA ASR API Call
        url = f"{self.base_url.rstrip('/')}/audio/transcriptions"
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        try:
            with open(file_path, "rb") as f:
                files = {"file": (os.path.basename(file_path), f, "audio/wav")}
                data = {"model": self.endpoint, "response_format": "verbose_json"}
                with httpx.Client(timeout=60.0) as client:
                    resp = client.post(url, headers=headers, files=files, data=data)
                    if resp.status_code != 200:
                        raise RuntimeError(f"NVIDIA ASR HTTP Error {resp.status_code}: {resp.text}")
                    res_json = resp.json()

            # Parse timestamped segments
            segments = []
            raw_segments = res_json.get("segments", [])
            if not raw_segments:
                # Single text output fallback
                full_text = res_json.get("text", "")
                if full_text:
                    segments.append({
                        "case_id": case_id,
                        "source_file": source_file,
                        "modality": "audio",
                        "content": full_text.strip(),
                        "timestamp_start": 0.0,
                        "timestamp_end": 10.0,
                        "speaker": None,
                        "confidence": 0.92,
                        "evidence_type": "transcript",
                        "extraction_method": "nvidia_asr"
                    })
            else:
                for idx, seg in enumerate(raw_segments):
                    segments.append({
                        "case_id": case_id,
                        "source_file": source_file,
                        "modality": "audio",
                        "content": seg.get("text", "").strip(),
                        "timestamp_start": float(seg.get("start", 0.0)),
                        "timestamp_end": float(seg.get("end", 0.0)),
                        "speaker": seg.get("speaker", None),
                        "confidence": round(float(seg.get("confidence", 0.90)), 2),
                        "evidence_type": "transcript",
                        "extraction_method": "nvidia_asr"
                    })

            return segments
        except Exception as e:
            raise RuntimeError(f"NVIDIA ASR processing error for '{source_file}': {str(e)}")
