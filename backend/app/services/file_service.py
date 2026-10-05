import os
import re
import uuid
from pathlib import Path
from typing import Tuple, Dict, Any
from app.core.config import MODALITY_MAP, ALLOWED_MIME_TYPES, UPLOADS_DIR, MAX_FILE_SIZE_BYTES

# File header magic bytes checks
MAGIC_BYTES_MAP = [
    (b"%PDF", ".pdf", "document", "application/pdf"),
    (b"\x89PNG\r\n\x1a\n", ".png", "image", "image/png"),
    (b"\xff\xd8\xff", ".jpg", "image", "image/jpeg"),
    (b"RIFF", ".wav", "audio", "audio/wav"),  # RIFF....WAVE
    (b"OggS", ".ogg", "audio", "audio/ogg"),
    (b"\x1a\x45\xdf\xa3", ".webm", "video", "video/webm"),  # WebM / MKV EBML
    (b"ID3", ".mp3", "audio", "audio/mp3"),
]

def sanitize_filename(filename: str) -> str:
    """Strip path traversal elements and sanitize filename."""
    basename = os.path.basename(filename)
    # Remove any non-alphanumeric, dot, dash, underscore
    clean_name = re.sub(r"[^\w\.-]", "_", basename)
    return clean_name or f"evidence_{uuid.uuid4().hex[:8]}"

def identify_file(filename: str, header_bytes: bytes, content_type: str) -> Tuple[str, str, str]:
    """
    Returns (modality, extension, mime_type).
    Raises ValueError if unsupported.
    """
    clean_name = sanitize_filename(filename)
    ext = Path(clean_name).suffix.lower()

    # Check magic bytes first if possible
    magic_modality = None
    magic_mime = None
    magic_ext = None

    for signature, m_ext, m_modality, m_mime in MAGIC_BYTES_MAP:
        if header_bytes.startswith(signature):
            magic_modality = m_modality
            magic_mime = m_mime
            magic_ext = m_ext
            break
        # Special check for WAV RIFF header: RIFF + 4 bytes + WAVE
        if signature == b"RIFF" and header_bytes.startswith(b"RIFF") and len(header_bytes) >= 12 and header_bytes[8:12] == b"WAVE":
            magic_modality = "audio"
            magic_mime = "audio/wav"
            magic_ext = ".wav"
            break
        # Special check for MP4/MOV ftyp atom
        if len(header_bytes) >= 12 and header_bytes[4:8] == b"ftyp":
            magic_modality = "video"
            magic_mime = content_type if "video" in content_type else "video/mp4"
            magic_ext = ext if ext in [".mp4", ".mov", ".m4a", ".mkv"] else ".mp4"
            break

    # Determine modality by extension or magic bytes
    modality = MODALITY_MAP.get(ext) or magic_modality or ALLOWED_MIME_TYPES.get(content_type)

    if not modality:
        raise ValueError(
            f"Unsupported file type '{ext}' (MIME: {content_type}). Supported categories: PDF documents, WAV/MP3/M4A/OGG audio, MP4/MOV/AVI/MKV/WEBM video, JPG/PNG/WEBP images."
        )

    # Resolve MIME type fallback
    mime_type = content_type
    if not mime_type or mime_type == "application/octet-stream":
        mime_type = magic_mime or (
            "application/pdf" if modality == "document" else
            "audio/wav" if ext == ".wav" else
            "audio/mpeg" if ext == ".mp3" else
            "video/mp4" if ext in [".mp4", ".mov"] else
            "image/jpeg" if ext in [".jpg", ".jpeg"] else
            "image/png" if ext == ".png" else "application/octet-stream"
        )

    return modality, ext, mime_type

def save_uploaded_file(case_id: str, original_filename: str, file_bytes: bytes) -> Tuple[Path, str]:
    """
    Saves file under storage/uploads/{case_id}/{safe_filename}.
    Generates a unique name if file already exists to avoid overwriting.
    """
    safe_case = re.sub(r"[^\w-]", "_", case_id)
    case_upload_dir = UPLOADS_DIR / safe_case
    case_upload_dir.mkdir(parents=True, exist_ok=True)

    clean_filename = sanitize_filename(original_filename)
    target_path = case_upload_dir / clean_filename

    # Prevent accidental overwrites by prepending unique suffix if file exists
    if target_path.exists():
        stem = Path(clean_filename).stem
        ext = Path(clean_filename).suffix
        unique_suffix = uuid.uuid4().hex[:6]
        clean_filename = f"{stem}_{unique_suffix}{ext}"
        target_path = case_upload_dir / clean_filename

    # Ensure path is strictly inside case_upload_dir (path traversal protection)
    target_path = target_path.resolve()
    if not str(target_path).startswith(str(case_upload_dir.resolve())):
        raise ValueError("Invalid target storage path (path traversal detected).")

    with open(target_path, "wb") as f:
        f.write(file_bytes)

    # Relative path for record
    rel_path = f"uploads/{safe_case}/{clean_filename}"
    return target_path, rel_path
