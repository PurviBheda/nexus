from typing import List, Dict, Any
from app.ai.extraction.visual_extractor import VisualExtractor

class VideoPipeline:
    """
    Multimodal Video Processing Pipeline.
    Extracts timestamped video visual events and neutral scene observations.
    """
    def __init__(self):
        self.extractor = VisualExtractor()

    def process(
        self, file_path: str, source_file: str, case_id: str, evidence_id: str
    ) -> List[Dict[str, Any]]:
        events = self.extractor.extract_video(file_path, source_file, case_id)

        for idx, ev in enumerate(events):
            ev["evidence_id"] = evidence_id
            ev["parent_evidence_id"] = evidence_id
            if "id" not in ev:
                ev["id"] = f"{evidence_id}_event_{idx+1:03d}"

        return events
