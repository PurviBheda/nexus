import os
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse, JSONResponse

from app.core.config import STORAGE_DIR
from app.schemas.evidence import EvidenceRecordSchema, UploadResponseSchema
from app.services.ingestion_service import (
    ingest_evidence,
    get_evidence_item,
    get_case_evidence,
)

router = APIRouter(prefix="/api/evidence", tags=["Evidence"])

@router.post("/upload", response_model=UploadResponseSchema, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    file: UploadFile = File(...),
    case_id: str = Form("CASE-001"),
):
    """
    Multimodal Evidence Upload Endpoint.
    Receives file, validates, stores in storage/uploads/{case_id}/, identifies modality,
    extracts basic technical metadata, and creates an evidence record in READY_FOR_AI stage.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided in request."
        )

    try:
        contents = await file.read()
        content_type = file.content_type or "application/octet-stream"
        
        record = ingest_evidence(
            case_id=case_id,
            filename=file.filename,
            content_type=content_type,
            file_bytes=contents
        )

        return UploadResponseSchema(
            success=True,
            evidence=EvidenceRecordSchema(**record),
            message=f"Evidence file '{file.filename}' uploaded and prepared successfully for case {case_id}."
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during evidence ingestion: {str(e)}"
        )

@router.get("", response_model=List[EvidenceRecordSchema])
async def list_evidence(case_id: Optional[str] = None):
    """List evidence records, optionally filtered by case_id."""
    if case_id:
        return get_case_evidence(case_id)
    # Default to CASE-001
    return get_case_evidence("CASE-001")

@router.get("/{evidence_id}", response_model=EvidenceRecordSchema)
async def get_evidence(evidence_id: str):
    """Retrieve single evidence record by ID."""
    record = get_evidence_item(evidence_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence item '{evidence_id}' not found."
        )
    return record

@router.get("/{evidence_id}/file")
async def get_evidence_file(evidence_id: str):
    """Stream/serve the stored evidence file."""
    record = get_evidence_item(evidence_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence item '{evidence_id}' not found."
        )

    storage_path = record.get("storage_path")
    if not storage_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No physical file path recorded for this evidence."
        )

    full_path = (STORAGE_DIR.parent / storage_path).resolve()
    if not full_path.exists() or not str(full_path).startswith(str(STORAGE_DIR.resolve())):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence file not found on disk."
        )

    return FileResponse(
        path=full_path,
        media_type=record.get("file_type", "application/octet-stream"),
        filename=record.get("source_file")
    )
