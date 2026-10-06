from typing import List, Dict, Any
from app.ai.providers.nemo_retriever import NeMoRetrieverProvider
from app.ai.providers.mock_provider import MockFallbackProvider
from app.ai.config import get_ai_status

class DocumentTextExtractor:
    """
    Extracts structured document text units preserving page provenance.
    """
    def __init__(self):
        self.nemo_provider = NeMoRetrieverProvider()
        self.mock_provider = MockFallbackProvider()

    def extract(self, file_path: str, source_file: str, case_id: str) -> List[Dict[str, Any]]:
        ai_status = get_ai_status()
        if ai_status["nvidia_configured"]:
            try:
                return self.nemo_provider.extract_document(file_path, source_file, case_id)
            except Exception as e:
                # Log error and fallback gracefully
                print(f"[DocumentTextExtractor] NVIDIA NeMo extraction error: {e}. Using mock fallback.")
        
        return self.mock_provider.extract_document(file_path, source_file, case_id)
