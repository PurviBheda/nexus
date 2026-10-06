from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from app.ai.config import get_ai_status
from app.schemas.evidence import (
    ProcessEvidenceResponseSchema,
    ProcessingSummarySchema,
    RetrievalQueryRequestSchema,
    RetrievalQueryResponseSchema,
    EvidenceUnitSchema
)
from app.services.ai_processing_service import AIProcessingService
from app.services.retrieval_service import RetrievalService
from app.services.ingestion_service import get_evidence_item, get_case_evidence

router = APIRouter(tags=["NVIDIA AI Pipeline"])
processing_service = AIProcessingService()
retrieval_service = RetrievalService()

@router.get("/api/ai/health")
async def get_ai_pipeline_health():
    """
    Returns AI provider status, NVIDIA configuration state, and LanceDB availability.
    """
    return get_ai_status()

@router.post("/api/evidence/{evidence_id}/process", response_model=ProcessEvidenceResponseSchema)
async def process_evidence_item_endpoint(evidence_id: str):
    """
    Starts NVIDIA AI Processing pipeline for an evidence record.
    Transitions through: READY_FOR_AI -> PROCESSING_AI -> EXTRACTING -> STRUCTURING -> EMBEDDING -> PROCESSED
    """
    item = get_evidence_item(evidence_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence item '{evidence_id}' not found."
        )

    try:
        result = processing_service.process_evidence_item(evidence_id)
        return ProcessEvidenceResponseSchema(
            success=result["success"],
            evidence=result["evidence"],
            summary=result["summary"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Processing failed: {str(e)}"
        )

@router.post("/api/investigations/{case_id}/process-all")
async def process_case_evidence_endpoint(case_id: str):
    """
    Starts NVIDIA AI Processing pipeline for all evidence items associated with case_id.
    """
    evidence_list = get_case_evidence(case_id)
    if not evidence_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No evidence found for investigation case '{case_id}'."
        )

    results = processing_service.process_case_evidence(case_id)
    return {
        "case_id": case_id,
        "processed_count": len(results),
        "details": results
    }

@router.get("/api/evidence/{evidence_id}/units", response_model=List[EvidenceUnitSchema])
async def get_evidence_units_endpoint(evidence_id: str):
    """
    Retrieves extracted structured evidence units for a single evidence record.
    """
    item = get_evidence_item(evidence_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence item '{evidence_id}' not found."
        )

    units = item.get("extracted_units", [])
    if not units:
        # Fallback to vector store lookup if present
        units = processing_service.vector_store.get_units_by_evidence_id(evidence_id)

    return units

@router.post("/api/retrieval/query", response_model=RetrievalQueryResponseSchema)
async def query_retrieval_endpoint(req: RetrievalQueryRequestSchema):
    """
    Retrieval Query Endpoint.
    Searches indexed evidence units and returns content + exact source provenance (file, page/timestamp).
    """
    try:
        res = retrieval_service.query(
            query_text=req.query,
            case_id=req.case_id,
            modality=req.modality,
            top_k=req.top_k
        )
        return RetrievalQueryResponseSchema(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Retrieval query failed: {str(e)}"
        )
