from typing import List, Dict, Any
from app.ai.extraction.visual_extractor import VisualExtractor

class ImagePipeline:
    """
    Multimodal Image Processing Pipeline.
    Extracts structured image observations using NVIDIA Vision-Language capabilities.
    """
    def __init__(self):
        self.extractor = VisualExtractor()

    def process(
        self, file_path: str, source_file: str, case_id: str, evidence_id: str
    ) -> List[Dict[str, Any]]:
        obs = self.extractor.extract_image(file_path, source_file, case_id)

        for idx, item in enumerate(obs):
            item["evidence_id"] = evidence_id
            item["parent_evidence_id"] = evidence_id
            if "id" not in item:
                item["id"] = f"{evidence_id}_obs_{idx+1:03d}"

        return obs
