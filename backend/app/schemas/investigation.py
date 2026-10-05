from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.evidence import EvidenceRecordSchema

class InvestigationCaseSchema(BaseModel):
    id: str
    title: str
    type: str
    description: str
    status: str = "ACTIVE"
    lead_investigator: str
    incident_date: str
    evidence_count: int = 0
    event_window: Optional[str] = None
    entities_count: int = 0
    overall_confidence: float = 0.0
    open_findings_count: int = 0
    progress: int = 0
    created_at: Optional[str] = None

class InvestigationDetailSchema(BaseModel):
    case: InvestigationCaseSchema
    evidence: List[EvidenceRecordSchema] = Field(default_factory=list)
