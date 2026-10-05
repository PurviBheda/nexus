from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.investigation import InvestigationCaseSchema, InvestigationDetailSchema
from app.schemas.evidence import EvidenceRecordSchema
from app.services.ingestion_service import (
    get_investigation_case,
    get_case_evidence,
)

router = APIRouter(prefix="/api/investigations", tags=["Investigations"])

@router.get("/{case_id}", response_model=InvestigationCaseSchema)
async def get_case(case_id: str):
    """Retrieve investigation case details by case_id."""
    case_data = get_investigation_case(case_id)
    if not case_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation case '{case_id}' not found."
        )
    return case_data

@router.get("/{case_id}/evidence", response_model=List[EvidenceRecordSchema])
async def get_case_evidence_route(case_id: str):
    """Retrieve all evidence items associated with a specific case."""
    case_data = get_investigation_case(case_id)
    if not case_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation case '{case_id}' not found."
        )
    return get_case_evidence(case_id)

@router.get("/{case_id}/details", response_model=InvestigationDetailSchema)
async def get_case_details(case_id: str):
    """Retrieve complete investigation case details including all evidence."""
    case_data = get_investigation_case(case_id)
    if not case_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation case '{case_id}' not found."
        )
    evidence_list = get_case_evidence(case_id)
    return InvestigationDetailSchema(
        case=case_data,
        evidence=evidence_list
    )
