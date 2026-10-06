from typing import List, Dict, Any
from app.ai.extraction.text_extractor import DocumentTextExtractor

class DocumentPipeline:
    """
    Multimodal Document Processing Pipeline.
    Extracts text chunks with page-level provenance.
    """
    def __init__(self):
        self.extractor = DocumentTextExtractor()

    def process(
        self, file_path: str, source_file: str, case_id: str, evidence_id: str
    ) -> List[Dict[str, Any]]:
        units = self.extractor.extract(file_path, source_file, case_id)
        
        # Attach evidence_id and parent_evidence_id for full provenance traceability
        for idx, u in enumerate(units):
            u["evidence_id"] = evidence_id
            u["parent_evidence_id"] = evidence_id
            if "id" not in u:
                u["id"] = f"{evidence_id}_chunk_{idx+1:03d}"

        return units
