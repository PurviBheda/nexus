import json
import uuid
import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.core.config import DB_FILE, UPLOADS_DIR
from app.services.file_service import identify_file, save_uploaded_file, MAX_FILE_SIZE_BYTES
from app.services.metadata_service import extract_metadata, format_file_size

def _load_db() -> Dict[str, Any]:
    if not DB_FILE.exists():
        initial_db = _get_initial_seed_db()
        _save_db(initial_db)
        return initial_db
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        initial_db = _get_initial_seed_db()
        _save_db(initial_db)
        return initial_db

def _save_db(data: Dict[str, Any]) -> None:
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def _get_initial_seed_db() -> Dict[str, Any]:
    return {
        "investigations": {
            "CASE-001": {
                "id": "CASE-001",
                "title": "Vehicle Collision Investigation",
                "type": "Traffic Incident",
                "description": "Multimodal investigation into a two-vehicle collision at the intersection of 5th Avenue and Market Street on Jan 14, 2025.",
                "status": "ACTIVE",
                "lead_investigator": "Alex Kim",
                "incident_date": "2025-01-14",
                "evidence_count": 7,
                "event_window": "18:39–18:45",
                "entities_count": 12,
                "overall_confidence": 87.0,
                "open_findings_count": 3,
                "progress": 92,
                "created_at": "2025-01-14T20:00:00Z"
            }
        },
        "evidence": {
            "EVD-001": {
                "id": "EVD-001",
                "case_id": "CASE-001",
                "source_file": "CCTV_intersection.mp4",
                "modality": "video",
                "file_type": "video/mp4",
                "file_size": 1288490188,
                "status": "analyzed",
                "processing_stage": "ready_for_ai",
                "storage_path": "uploads/CASE-001/CCTV_intersection.mp4",
                "content": "Intersection security camera recording showing Vehicle A entering intersection eastbound on Market St and Vehicle B initiating left turn.",
                "timestamp_start": "18:39:34",
                "timestamp_end": "18:42:52",
                "confidence": 96.0,
                "created_at": "2025-01-14T20:08:00Z",
                "metadata": {
                    "duration_formatted": "03:18.221",
                    "resolution": "3840 × 2160",
                    "file_size_formatted": "1.2 GB"
                },
                "relationships": [
                    {"type": "SUPPORTS", "target": "Impact sequence geometry", "confidence": 96.0},
                    {"type": "CONTRADICTS", "target": "Witness signal timing statement", "confidence": 92.0},
                    {"type": "RELATED_TO", "target": "Vehicle A damage photos", "confidence": 89.0}
                ]
            },
            "EVD-002": {
                "id": "EVD-002",
                "case_id": "CASE-001",
                "source_file": "witness_statement.wav",
                "modality": "audio",
                "file_type": "audio/wav",
                "file_size": 88394956,
                "status": "analyzed",
                "processing_stage": "ready_for_ai",
                "storage_path": "uploads/CASE-001/witness_statement.wav",
                "content": "Audio statement from bystander Elena R. describing traffic signal change as Vehicle A approached the intersection.",
                "timestamp_start": "02:16",
                "timestamp_end": "03:45",
                "speaker": "Elena R. (Witness)",
                "confidence": 84.0,
                "created_at": "2025-01-14T21:15:00Z",
                "metadata": {
                    "duration_formatted": "08:42.100",
                    "file_size_formatted": "84.3 MB"
                },
                "relationships": [
                    {"type": "CONTRADICTS", "target": "CCTV traffic signal timing frame analysis", "confidence": 92.0},
                    {"type": "SUPPORTS", "target": "Vehicle B turn initiation timing", "confidence": 88.0}
                ]
            },
            "EVD-003": {
                "id": "EVD-003",
                "case_id": "CASE-001",
                "source_file": "police_report.pdf",
                "modality": "document",
                "file_type": "application/pdf",
                "file_size": 2936012,
                "status": "analyzed",
                "processing_stage": "ready_for_ai",
                "storage_path": "uploads/CASE-001/police_report.pdf",
                "content": "Official initial police incident report filed by Officer J. Vance documenting scene observations, weather conditions, and driver statements.",
                "page": 4,
                "confidence": 94.0,
                "created_at": "2025-01-15T08:30:00Z",
                "metadata": {
                    "page_count": 14,
                    "file_size_formatted": "2.8 MB"
                },
                "relationships": [
                    {"type": "SUPPORTS", "target": "Dispatch contact timeline", "confidence": 95.0},
                    {"type": "RELATED_TO", "target": "Insurance claim liability details", "confidence": 91.0}
                ]
            },
            "EVD-004": {
                "id": "EVD-004",
                "case_id": "CASE-001",
                "source_file": "insurance_claim.pdf",
                "modality": "document",
                "file_type": "application/pdf",
                "file_size": 1468006,
                "status": "analyzed",
                "processing_stage": "ready_for_ai",
                "storage_path": "uploads/CASE-001/insurance_claim.pdf",
                "content": "First notice of loss claim report submitted by Vehicle A policyholder citing green light intersection entry.",
                "page": 2,
                "confidence": 89.0,
                "created_at": "2025-01-15T11:20:00Z",
                "metadata": {
                    "page_count": 6,
                    "file_size_formatted": "1.4 MB"
                },
                "relationships": [
                    {"type": "SUPPORTS", "target": "Vehicle A pre-collision heading", "confidence": 90.0}
                ]
            },
            "EVD-005": {
                "id": "EVD-005",
                "case_id": "CASE-001",
                "source_file": "repair_estimate.pdf",
                "modality": "document",
                "file_type": "application/pdf",
                "file_size": 911360,
                "status": "analyzed",
                "processing_stage": "ready_for_ai",
                "storage_path": "uploads/CASE-001/repair_estimate.pdf",
                "content": "Comprehensive mechanical repair estimate detailing structural deformation to Vehicle A front-left bumper, fender, and suspension.",
                "page": 1,
                "confidence": 95.0,
                "created_at": "2025-01-16T09:45:00Z",
                "metadata": {
                    "page_count": 4,
                    "file_size_formatted": "890 KB"
                },
                "relationships": [
                    {"type": "SUPPORTS", "target": "Vehicle damage photo visual geometry", "confidence": 97.0}
                ]
            },
            "EVD-006": {
                "id": "EVD-006",
                "case_id": "CASE-001",
                "source_file": "vehicle_damage_01.jpg",
                "modality": "image",
                "file_type": "image/jpeg",
                "file_size": 13002342,
                "status": "analyzed",
                "processing_stage": "ready_for_ai",
                "storage_path": "uploads/CASE-001/vehicle_damage_01.jpg",
                "content": "High-resolution post-collision photograph of Vehicle A front-left quarter deformation taken at scene.",
                "confidence": 97.0,
                "created_at": "2025-01-14T19:30:00Z",
                "metadata": {
                    "dimensions": "6000 × 4000",
                    "file_size_formatted": "12.4 MB"
                },
                "relationships": [
                    {"type": "SUPPORTS", "target": "Estimated 38° impact angle calculation", "confidence": 96.0}
                ]
            },
            "EVD-007": {
                "id": "EVD-007",
                "case_id": "CASE-001",
                "source_file": "vehicle_damage_02.jpg",
                "modality": "image",
                "file_type": "image/jpeg",
                "file_size": 12373196,
                "status": "analyzed",
                "processing_stage": "ready_for_ai",
                "storage_path": "uploads/CASE-001/vehicle_damage_02.jpg",
                "content": "High-resolution photograph of Vehicle B passenger side impact panel showing paint transfer and dent depth profile.",
                "confidence": 96.0,
                "created_at": "2025-01-14T19:32:00Z",
                "metadata": {
                    "dimensions": "6000 × 4000",
                    "file_size_formatted": "11.8 MB"
                },
                "relationships": [
                    {"type": "SUPPORTS", "target": "Vehicle A paint match & kinetic transfer", "confidence": 94.0}
                ]
            }
        }
    }

def get_investigation_case(case_id: str) -> Optional[Dict[str, Any]]:
    db = _load_db()
    return db["investigations"].get(case_id)

def get_case_evidence(case_id: str) -> List[Dict[str, Any]]:
    db = _load_db()
    results = [
        item for item in db["evidence"].values()
        if item.get("case_id") == case_id
    ]
    # Sort newest first
    results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return results

def get_evidence_item(evidence_id: str) -> Optional[Dict[str, Any]]:
    db = _load_db()
    return db["evidence"].get(evidence_id)

def ingest_evidence(case_id: str, filename: str, content_type: str, file_bytes: bytes) -> Dict[str, Any]:
    """
    Ingests file through the full stage pipeline:
    UPLOADING -> UPLOADED -> VALIDATING -> METADATA_EXTRACTED -> READY_FOR_AI
    """
    # 1. Basic validation
    if not file_bytes or len(file_bytes) == 0:
        raise ValueError("Uploaded file is empty (0 bytes).")
    
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size exceeds limit ({format_file_size(MAX_FILE_SIZE_BYTES)}).")

    # 2. Identify Modality & Validate MIME / Magic Bytes
    header_bytes = file_bytes[:1024]
    modality, ext, mime_type = identify_file(filename, header_bytes, content_type)

    # 3. Save File Safely
    saved_path, rel_storage_path = save_uploaded_file(case_id, filename, file_bytes)

    # 4. Extract Technical Metadata
    metadata = extract_metadata(saved_path, modality, mime_type, len(file_bytes))

    # 5. Create Evidence Record
    evidence_id = f"evidence_{uuid.uuid4().hex[:10]}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    evidence_record = {
        "id": evidence_id,
        "case_id": case_id,
        "source_file": saved_path.name,
        "modality": modality,
        "file_type": mime_type,
        "file_size": len(file_bytes),
        "status": "uploaded",
        "processing_stage": "ready_for_ai",
        "storage_path": rel_storage_path,
        "content": None,  # Will be populated by AI pipeline tomorrow
        "timestamp_start": None,
        "timestamp_end": None,
        "page": metadata.get("page_count"),
        "speaker": None,
        "confidence": None,
        "created_at": now_iso,
        "metadata": metadata,
        "relationships": []
    }

    # 6. Save in DB
    db = _load_db()
    if case_id not in db["investigations"]:
        # Create default case if it doesn't exist
        db["investigations"][case_id] = {
            "id": case_id,
            "title": f"Investigation {case_id}",
            "type": "General Investigation",
            "description": f"Evidence records for {case_id}",
            "status": "ACTIVE",
            "lead_investigator": "System Investigator",
            "incident_date": datetime.date.today().isoformat(),
            "evidence_count": 0,
            "overall_confidence": 0.0,
            "open_findings_count": 0,
            "progress": 10,
            "created_at": now_iso
        }

    db["evidence"][evidence_id] = evidence_record
    db["investigations"][case_id]["evidence_count"] = len(
        [e for e in db["evidence"].values() if e.get("case_id") == case_id]
    )
    _save_db(db)

    return evidence_record
