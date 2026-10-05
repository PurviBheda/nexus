# NEXUS Backend — Multimodal Evidence Intelligence Service

FastAPI service for uploading, validating, storing, identifying modality, and extracting basic technical metadata from multimodal evidence files (PDF, Audio, Video, Image).

## Features

- **Multimodal Upload (`POST /api/evidence/upload`)**: Upload PDF documents, Audio (WAV, MP3, M4A, OGG), Video (MP4, MOV, AVI, MKV, WEBM), and Images (JPG, PNG, WEBP).
- **Modality Identification & Header Validation**: Validates file extension and magic bytes/MIME headers to reject invalid file formats.
- **Safe Storage**: Stores files in `storage/uploads/{case_id}/` with path traversal protection and duplicate file collision prevention.
- **Basic Metadata Extraction**: Extracts page counts (PDF), duration/sample rate (Audio), resolution/duration (Video), and image dimensions (Images).
- **Processing Lifecycle**: Manages transition states (`UPLOADING` -> `UPLOADED` -> `VALIDATING` -> `METADATA_EXTRACTED` -> `READY_FOR_AI`).
- **Investigation API**: Query cases (`GET /api/investigations/{case_id}`) and case evidence (`GET /api/investigations/{case_id}/evidence`).

## Setup & Running

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run FastAPI backend server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API documentation will be available at: `http://localhost:8000/docs`
