from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class EvidenceRelationshipSchema(BaseModel):
    type: str
    target: str
    confidence: float

class EvidenceRecordSchema(BaseModel):
    id: str
    case_id: str
    source_file: str
    modality: str  # document, audio, video, image
    file_type: str  # MIME type e.g. audio/wav
    file_size: int  # in bytes
    status: str = "uploaded"  # uploaded, analyzed, error
    processing_stage: str = "ready_for_ai"  # uploading, uploaded, validating, metadata_extracted, ready_for_ai, processing_error
    storage_path: Optional[str] = None
    content: Optional[str] = None
    timestamp_start: Optional[str] = None
    timestamp_end: Optional[str] = None
    page: Optional[int] = None
    speaker: Optional[str] = None
    confidence: Optional[float] = None
    created_at: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    relationships: List[EvidenceRelationshipSchema] = Field(default_factory=list)

class UploadResponseSchema(BaseModel):
    success: bool
    evidence: EvidenceRecordSchema
    message: Optional[str] = "Evidence uploaded and prepared successfully."
