import os
import struct
from pathlib import Path
from typing import Dict, Any, Optional

def extract_metadata(file_path: Path, modality: str, mime_type: str, file_size: int) -> Dict[str, Any]:
    """
    Extract basic technical metadata for the file based on modality.
    No semantic AI processing is performed.
    """
    metadata: Dict[str, Any] = {
        "filename": file_path.name,
        "mime_type": mime_type,
        "file_size": file_size,
        "file_size_formatted": format_file_size(file_size),
    }

    try:
        if modality == "document":
            _extract_pdf_metadata(file_path, metadata)
        elif modality == "image":
            _extract_image_metadata(file_path, metadata)
        elif modality == "audio":
            _extract_audio_metadata(file_path, metadata)
        elif modality == "video":
            _extract_video_metadata(file_path, metadata)
    except Exception as e:
        metadata["extraction_warning"] = f"Partial metadata extracted: {str(e)}"

    return metadata

def format_file_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"

def _extract_pdf_metadata(file_path: Path, metadata: Dict[str, Any]) -> None:
    try:
        import pypdf
        reader = pypdf.PdfReader(str(file_path))
        page_count = len(reader.pages)
        metadata["page_count"] = page_count
        if reader.metadata:
            if reader.metadata.title:
                metadata["title"] = str(reader.metadata.title)
            if reader.metadata.author:
                metadata["author"] = str(reader.metadata.author)
    except Exception:
        # Fallback pdf page count regex search if pypdf parse fails
        try:
            with open(file_path, "rb") as f:
                content = f.read(2000000)
                pages = content.count(b"/Type /Page") - content.count(b"/Type /Pages")
                if pages > 0:
                    metadata["page_count"] = pages
        except Exception:
            pass

def _extract_image_metadata(file_path: Path, metadata: Dict[str, Any]) -> None:
    try:
        from PIL import Image
        with Image.open(file_path) as img:
            metadata["width"] = img.width
            metadata["height"] = img.height
            metadata["dimensions"] = f"{img.width}×{img.height}"
            metadata["format"] = img.format
            metadata["mode"] = img.mode
    except Exception:
        pass

def _extract_audio_metadata(file_path: Path, metadata: Dict[str, Any]) -> None:
    extracted = False
    try:
        from tinytag import TinyTag
        tag = TinyTag.get(str(file_path))
        if tag.duration:
            metadata["duration_seconds"] = round(tag.duration, 2)
            metadata["duration_formatted"] = format_duration(tag.duration)
            extracted = True
        if tag.samplerate:
            metadata["sample_rate"] = tag.samplerate
        if tag.channels:
            metadata["channels"] = tag.channels
        if tag.bitrate:
            metadata["bitrate_kbps"] = round(tag.bitrate, 1)
    except Exception:
        pass

    # Fallback for WAV using stdlib wave
    if not extracted and file_path.suffix.lower() == ".wav":
        try:
            import wave
            with wave.open(str(file_path), "rb") as wf:
                frames = wf.getnframes()
                rate = wf.getframerate()
                channels = wf.getnchannels()
                duration = frames / float(rate)
                metadata["duration_seconds"] = round(duration, 2)
                metadata["duration_formatted"] = format_duration(duration)
                metadata["sample_rate"] = rate
                metadata["channels"] = channels
        except Exception:
            pass

def _extract_video_metadata(file_path: Path, metadata: Dict[str, Any]) -> None:
    extracted = False
    try:
        from tinytag import TinyTag
        tag = TinyTag.get(str(file_path))
        if tag.duration:
            metadata["duration_seconds"] = round(tag.duration, 2)
            metadata["duration_formatted"] = format_duration(tag.duration)
            extracted = True
        if tag.bitrate:
            metadata["bitrate_kbps"] = round(tag.bitrate, 1)
    except Exception:
        pass

    # Quick header scan for MP4 dimensions if needed
    try:
        if file_path.suffix.lower() in [".mp4", ".mov"]:
            width, height = _parse_mp4_dimensions(file_path)
            if width and height:
                metadata["width"] = width
                metadata["height"] = height
                metadata["resolution"] = f"{width} × {height}"
    except Exception:
        pass

def format_duration(seconds: float) -> str:
    mins = int(seconds // 60)
    secs = int(seconds % 60)
    millis = int((seconds - int(seconds)) * 1000)
    return f"{mins:02d}:{secs:02d}.{millis:03d}"

def _parse_mp4_dimensions(file_path: Path) -> tuple[Optional[int], Optional[int]]:
    """Parse elementary MP4 mvhd/tkhd atom to find width & height."""
    try:
        with open(file_path, "rb") as f:
            data = f.read(100000)
            idx = data.find(b"tkhd")
            if idx != -1 and idx + 84 <= len(data):
                # Width and height are 16.16 fixed point numbers at offset 76 & 80 in tkhd v0
                w_raw = struct.unpack(">I", data[idx+76:idx+80])[0]
                h_raw = struct.unpack(">I", data[idx+80:idx+84])[0]
                width = w_raw >> 16
                height = h_raw >> 16
                if 100 <= width <= 8192 and 100 <= height <= 8192:
                    return width, height
    except Exception:
        pass
    return None, None
