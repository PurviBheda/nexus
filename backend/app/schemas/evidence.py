from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class EvidenceRelationshipSchema(BaseModel):
    type: str
    target: str
    confidence: float

class EvidenceUnitSchema(BaseModel):
    id: str
    evidence_id: str
    case_id: str
    source_file: str
    modality: str  # document, audio, video, image
    content: str
    timestamp_start: Optional[float] = None
    timestamp_end: Optional[float] = None
    page: Optional[int] = None
    speaker: Optional[str] = None
    confidence: Optional[float] = None
    evidence_type: str  # transcript, document_text, document_table, video_event, image_observation, visual_event, metadata
    extraction_method: str  # nvidia_asr, nemo_retriever, nvidia_vlm, metadata_extraction, mock_fallback, other
    parent_evidence_id: Optional[str] = None
    created_at: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    score: Optional[float] = None

class EvidenceRecordSchema(BaseModel):
    id: str
    case_id: str
    source_file: str
    modality: str  # document, audio, video, image
    file_type: str  # MIME type e.g. audio/wav
    file_size: int  # in bytes
    status: str = "uploaded"  # uploaded, analyzed, processed, error
    processing_stage: str = "ready_for_ai"  # uploading, uploaded, validating, metadata_extracted, ready_for_ai, processing_ai, extracting, structuring, embedding, processed, processing_error
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
    extracted_units: List[EvidenceUnitSchema] = Field(default_factory=list)

class UploadResponseSchema(BaseModel):
    success: bool
    evidence: EvidenceRecordSchema
    message: Optional[str] = "Evidence uploaded and prepared successfully."

class ProcessingSummarySchema(BaseModel):
    evidence_id: str
    case_id: str
    source_file: str
    modality: str
    status: str
    processing_stage: str
    extracted_units_count: int
    document_chunks_count: int = 0
    transcript_segments_count: int = 0
    video_events_count: int = 0
    image_observations_count: int = 0
    embedding_status: str
    processing_time_ms: float
    extraction_method_used: str
    error_message: Optional[str] = None

class ProcessEvidenceResponseSchema(BaseModel):
    success: bool
    evidence: EvidenceRecordSchema
    summary: ProcessingSummarySchema

class RetrievalQueryRequestSchema(BaseModel):
    query: str
    case_id: Optional[str] = "CASE-001"
    modality: Optional[str] = None
    top_k: int = 5

class RetrievalQueryResultItemSchema(BaseModel):
    unit: EvidenceUnitSchema
    source_provenance: str
    relevance_score: float

class RetrievalQueryResponseSchema(BaseModel):
    query: str
    case_id: Optional[str]
    results_count: int
    results: List[RetrievalQueryResultItemSchema]
