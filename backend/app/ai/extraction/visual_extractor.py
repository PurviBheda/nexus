from typing import List, Dict, Any
from app.ai.providers.nvidia_vlm import NVIDIAVLMProvider
from app.ai.providers.mock_provider import MockFallbackProvider
from app.ai.config import get_ai_status

class VisualExtractor:
    """
    Extracts visual observations from images and timestamped scene events from video.
    Enforces cautious, factual observations.
    """
    def __init__(self):
        self.vlm_provider = NVIDIAVLMProvider()
        self.mock_provider = MockFallbackProvider()

    def extract_image(self, file_path: str, source_file: str, case_id: str) -> List[Dict[str, Any]]:
        ai_status = get_ai_status()
        if ai_status["nvidia_configured"]:
            try:
                return self.vlm_provider.analyze_image(file_path, source_file, case_id)
            except Exception as e:
                print(f"[VisualExtractor] NVIDIA VLM image error: {e}. Using mock fallback.")

        return self.mock_provider.analyze_image(file_path, source_file, case_id)

    def extract_video(self, file_path: str, source_file: str, case_id: str) -> List[Dict[str, Any]]:
        ai_status = get_ai_status()
        if ai_status["nvidia_configured"]:
            try:
                return self.vlm_provider.process_video(file_path, source_file, case_id)
            except Exception as e:
                print(f"[VisualExtractor] NVIDIA VLM video error: {e}. Using mock fallback.")

        return self.mock_provider.process_video(file_path, source_file, case_id)
