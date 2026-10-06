import os
import pypdf
from typing import List, Dict, Any
from app.ai.providers.base import (
    BaseDocumentProcessor,
    BaseAudioProcessor,
    BaseVideoProcessor,
    BaseImageProcessor
)

class MockFallbackProvider(
    BaseDocumentProcessor,
    BaseAudioProcessor,
    BaseVideoProcessor,
    BaseImageProcessor
):
    """
    Deterministic Mock Fallback Provider for local development & offline testing.
    Used when NVIDIA API key is not configured.
    Extracts real file text where available and structures realistic page/timestamp evidence units.
    Labeling extraction_method as 'mock_fallback' for transparency.
    """

    def extract_document(
        self, file_path: str, source_file: str, case_id: str
    ) -> List[Dict[str, Any]]:
        units = []
        filename = source_file.lower()

        # If it's a real PDF file on disk, attempt to read actual page text first
        if os.path.exists(file_path) and file_path.endswith(".pdf"):
            try:
                reader = pypdf.PdfReader(file_path)
                for i, page in enumerate(reader.pages):
                    text = page.extract_text() or ""
                    if text.strip():
                        units.append({
                            "case_id": case_id,
                            "source_file": source_file,
                            "modality": "document",
                            "content": text.strip(),
                            "page": i + 1,
                            "timestamp_start": None,
                            "timestamp_end": None,
                            "speaker": None,
                            "confidence": 0.95,
                            "evidence_type": "document_text",
                            "extraction_method": "mock_fallback"
                        })
                if units:
                    return units
            except Exception:
                pass

        # Demo File Fallbacks with explicit page provenance
        if "police_report" in filename:
            units = [
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "document",
                    "content": "Official Incident Report: Two-vehicle collision occurred at intersection of 5th Ave and Market Street on Jan 14, 2025.",
                    "page": 1,
                    "confidence": 0.97,
                    "evidence_type": "document_text",
                    "extraction_method": "mock_fallback"
                },
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "document",
                    "content": "Officer J. Vance noted dry asphalt conditions, clear visibility, and functioning traffic signals at time of dispatch.",
                    "page": 3,
                    "confidence": 0.95,
                    "evidence_type": "document_text",
                    "extraction_method": "mock_fallback"
                },
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "document",
                    "content": "Collision occurred approximately at 18:41:20 based on initial telemetry and dispatch log timestamping.",
                    "page": 7,
                    "confidence": 0.97,
                    "evidence_type": "document_text",
                    "extraction_method": "mock_fallback"
                }
            ]
        elif "insurance_claim" in filename:
            units = [
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "document",
                    "content": "First Notice of Loss: Policyholder states Vehicle A entered intersection eastbound under a solid green light before impact.",
                    "page": 1,
                    "confidence": 0.91,
                    "evidence_type": "document_text",
                    "extraction_method": "mock_fallback"
                },
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "document",
                    "content": "Driver reported moderate front-left bumper impact resulting in steering alignment failure and non-drivable state.",
                    "page": 2,
                    "confidence": 0.89,
                    "evidence_type": "document_text",
                    "extraction_method": "mock_fallback"
                }
            ]
        elif "repair_estimate" in filename:
            units = [
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "document",
                    "content": "Damage Inspection: Major structural deformation to Vehicle A front-left bumper, subframe rail, and front suspension assembly.",
                    "page": 1,
                    "confidence": 0.96,
                    "evidence_type": "document_table",
                    "extraction_method": "mock_fallback"
                },
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "document",
                    "content": "Total estimated repair cost: $14,280.00 including OEM structural replacement and alignment calibration.",
                    "page": 3,
                    "confidence": 0.94,
                    "evidence_type": "document_table",
                    "extraction_method": "mock_fallback"
                }
            ]
        else:
            units = [
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "document",
                    "content": f"Document content extracted from {source_file}.",
                    "page": 1,
                    "confidence": 0.90,
                    "evidence_type": "document_text",
                    "extraction_method": "mock_fallback"
                }
            ]

        return units

    def transcribe_audio(
        self, file_path: str, source_file: str, case_id: str
    ) -> List[Dict[str, Any]]:
        filename = source_file.lower()

        if "witness_statement" in filename:
            return [
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "audio",
                    "content": "I was standing outside the coffee shop on Market Street when I heard the engine acceleration.",
                    "timestamp_start": 12.0,
                    "timestamp_end": 28.5,
                    "speaker": "Elena R. (Witness)",
                    "confidence": 0.95,
                    "evidence_type": "transcript",
                    "extraction_method": "mock_fallback"
                },
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "audio",
                    "content": "The vehicle was stationary before impact while waiting for the turn signal to clear.",
                    "timestamp_start": 138.0,
                    "timestamp_end": 151.0,
                    "speaker": "Elena R. (Witness)",
                    "confidence": 0.94,
                    "evidence_type": "transcript",
                    "extraction_method": "mock_fallback"
                },
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "audio",
                    "content": "The light was yellow for northbound traffic when Vehicle B initiated the left turn.",
                    "timestamp_start": 195.0,
                    "timestamp_end": 210.0,
                    "speaker": "Elena R. (Witness)",
                    "confidence": 0.91,
                    "evidence_type": "transcript",
                    "extraction_method": "mock_fallback"
                }
            ]
        else:
            return [
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "audio",
                    "content": f"Audio recording transcription segment from {source_file}.",
                    "timestamp_start": 0.0,
                    "timestamp_end": 15.0,
                    "speaker": "Speaker 1",
                    "confidence": 0.88,
                    "evidence_type": "transcript",
                    "extraction_method": "mock_fallback"
                }
            ]

    def process_video(
        self, file_path: str, source_file: str, case_id: str
    ) -> List[Dict[str, Any]]:
        filename = source_file.lower()

        if "cctv_intersection" in filename or "cctv" in filename:
            return [
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "video",
                    "content": "Vehicle appears to be moving toward the intersection in eastbound lane on Market St.",
                    "timestamp_start": 252.0,
                    "timestamp_end": 260.0,
                    "speaker": None,
                    "confidence": 0.88,
                    "evidence_type": "video_event",
                    "extraction_method": "mock_fallback"
                },
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "video",
                    "content": "Second vehicle visible executing turn across oncoming traffic lane.",
                    "timestamp_start": 261.0,
                    "timestamp_end": 268.0,
                    "speaker": None,
                    "confidence": 0.92,
                    "evidence_type": "video_event",
                    "extraction_method": "mock_fallback"
                },
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "video",
                    "content": "Apparent contact observed near center of intersection zone.",
                    "timestamp_start": 269.0,
                    "timestamp_end": 273.0,
                    "speaker": None,
                    "confidence": 0.95,
                    "evidence_type": "video_event",
                    "extraction_method": "mock_fallback"
                }
            ]
        else:
            return [
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "video",
                    "content": f"Video event observation extracted from {source_file}.",
                    "timestamp_start": 0.0,
                    "timestamp_end": 10.0,
                    "speaker": None,
                    "confidence": 0.85,
                    "evidence_type": "video_event",
                    "extraction_method": "mock_fallback"
                }
            ]

    def analyze_image(
        self, file_path: str, source_file: str, case_id: str
    ) -> List[Dict[str, Any]]:
        filename = source_file.lower()

        if "vehicle_damage_01" in filename:
            return [
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "image",
                    "content": "Visible damage is concentrated near the front-left bumper, headlamp housing, and front fender panel of the vehicle.",
                    "timestamp_start": None,
                    "timestamp_end": None,
                    "page": None,
                    "speaker": None,
                    "confidence": 0.86,
                    "evidence_type": "image_observation",
                    "extraction_method": "mock_fallback"
                }
            ]
        elif "vehicle_damage_02" in filename:
            return [
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "image",
                    "content": "High-resolution photo showing deep side door impact panel deformation with clear paint transfer marks and panel crease.",
                    "timestamp_start": None,
                    "timestamp_end": None,
                    "page": None,
                    "speaker": None,
                    "confidence": 0.94,
                    "evidence_type": "image_observation",
                    "extraction_method": "mock_fallback"
                }
            ]
        else:
            return [
                {
                    "case_id": case_id,
                    "source_file": source_file,
                    "modality": "image",
                    "content": f"Visual observation extracted from image evidence file {source_file}.",
                    "timestamp_start": None,
                    "timestamp_end": None,
                    "page": None,
                    "speaker": None,
                    "confidence": 0.85,
                    "evidence_type": "image_observation",
                    "extraction_method": "mock_fallback"
                }
            ]
