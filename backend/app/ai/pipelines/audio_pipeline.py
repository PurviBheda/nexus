from typing import List, Dict, Any
from app.ai.extraction.transcript_extractor import TranscriptExtractor

class AudioPipeline:
    """
    Multimodal Audio Processing Pipeline.
    Transcribes audio into timestamped segments with speaker attribution.
    """
    def __init__(self):
        self.extractor = TranscriptExtractor()

    def process(
        self, file_path: str, source_file: str, case_id: str, evidence_id: str
    ) -> List[Dict[str, Any]]:
        segments = self.extractor.extract(file_path, source_file, case_id)
        
        for idx, seg in enumerate(segments):
            seg["evidence_id"] = evidence_id
            seg["parent_evidence_id"] = evidence_id
            if "id" not in seg:
                seg["id"] = f"{evidence_id}_seg_{idx+1:03d}"

        return segments
