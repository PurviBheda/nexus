from typing import List, Dict, Any
from app.ai.providers.nvidia_asr import NVIDIAASRProvider
from app.ai.providers.mock_provider import MockFallbackProvider
from app.ai.config import get_ai_status

class TranscriptExtractor:
    """
    Extracts timestamped audio transcript segments preserving time provenance.
    """
    def __init__(self):
        self.asr_provider = NVIDIAASRProvider()
        self.mock_provider = MockFallbackProvider()

    def extract(self, file_path: str, source_file: str, case_id: str) -> List[Dict[str, Any]]:
        ai_status = get_ai_status()
        if ai_status["nvidia_configured"]:
            try:
                return self.asr_provider.transcribe_audio(file_path, source_file, case_id)
            except Exception as e:
                print(f"[TranscriptExtractor] NVIDIA ASR error: {e}. Using mock fallback.")

        return self.mock_provider.transcribe_audio(file_path, source_file, case_id)
