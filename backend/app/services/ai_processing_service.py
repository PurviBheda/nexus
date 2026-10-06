import time
import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

from app.core.config import STORAGE_DIR
from app.services.ingestion_service import _load_db, _save_db, get_evidence_item
from app.ai.pipelines.document_pipeline import DocumentPipeline
from app.ai.pipelines.audio_pipeline import AudioPipeline
from app.ai.pipelines.video_pipeline import VideoPipeline
from app.ai.pipelines.image_pipeline import ImagePipeline
from app.ai.retrieval.embeddings import NVIDIAEmbeddingProvider
from app.ai.retrieval.lancedb_store import LanceDBVectorStore
from app.ai.config import get_ai_status

class AIProcessingService:
    """
    Service orchestrating the NVIDIA AI evidence processing pipeline.
    Flow: READY_FOR_AI -> PROCESSING_AI -> EXTRACTING -> STRUCTURING -> EMBEDDING -> PROCESSED
    """
    def __init__(self):
        self.doc_pipeline = DocumentPipeline()
        self.audio_pipeline = AudioPipeline()
        self.video_pipeline = VideoPipeline()
        self.image_pipeline = ImagePipeline()
        self.embedding_provider = NVIDIAEmbeddingProvider()
        self.vector_store = LanceDBVectorStore()

    def process_evidence_item(self, evidence_id: str) -> Dict[str, Any]:
        start_time = time.time()
        record = get_evidence_item(evidence_id)
        if not record:
            raise ValueError(f"Evidence record '{evidence_id}' not found.")

        modality = record.get("modality", "document")
        source_file = record.get("source_file", "")
        case_id = record.get("case_id", "CASE-001")
        storage_path = record.get("storage_path", "")

        # Resolve file path on disk
        if storage_path:
            full_file_path = str((STORAGE_DIR.parent / storage_path).resolve())
        else:
            full_file_path = ""

        # Stage 1: PROCESSING_AI
        self._update_stage(evidence_id, "processing_ai", "processing")

        try:
            # Stage 2: EXTRACTING & STRUCTURING
            self._update_stage(evidence_id, "extracting", "processing")
            
            raw_units: List[Dict[str, Any]] = []
            if modality == "document":
                raw_units = self.doc_pipeline.process(full_file_path, source_file, case_id, evidence_id)
            elif modality == "audio":
                raw_units = self.audio_pipeline.process(full_file_path, source_file, case_id, evidence_id)
            elif modality == "video":
                raw_units = self.video_pipeline.process(full_file_path, source_file, case_id, evidence_id)
            elif modality == "image":
                raw_units = self.image_pipeline.process(full_file_path, source_file, case_id, evidence_id)
            else:
                raw_units = self.doc_pipeline.process(full_file_path, source_file, case_id, evidence_id)

            self._update_stage(evidence_id, "structuring", "processing")

            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            processed_units = []
            texts_to_embed = []

            # Populate ISO created_at and clean unit metadata
            for idx, unit in enumerate(raw_units):
                unit_id = unit.get("id") or f"{evidence_id}_unit_{idx+1:03d}"
                unit["id"] = unit_id
                unit["evidence_id"] = evidence_id
                unit["case_id"] = case_id
                unit["source_file"] = source_file
                unit["modality"] = modality
                unit["created_at"] = now_iso
                
                processed_units.append(unit)
                texts_to_embed.append(unit.get("content", ""))

            # Stage 3: EMBEDDING & INDEXING IN LANCEDB
            self._update_stage(evidence_id, "embedding", "processing")
            
            vectors = []
            embedding_status = "completed"
            if texts_to_embed:
                try:
                    vectors = self.embedding_provider.embed_texts(texts_to_embed)
                    self.vector_store.add_evidence_units(processed_units, vectors)
                except Exception as emb_err:
                    print(f"[AIProcessingService] Embedding/Indexing warning: {emb_err}")
                    embedding_status = "partially_failed"

            # Count breakdown
            doc_chunks = len([u for u in processed_units if u.get("evidence_type") in ("document_text", "document_table")])
            transcript_segs = len([u for u in processed_units if u.get("evidence_type") == "transcript"])
            video_evs = len([u for u in processed_units if u.get("evidence_type") == "video_event"])
            img_obs = len([u for u in processed_units if u.get("evidence_type") == "image_observation"])

            extraction_methods = list(set([u.get("extraction_method", "unknown") for u in processed_units]))
            primary_method = extraction_methods[0] if extraction_methods else "nvidia_pipeline"

            elapsed_ms = round((time.time() - start_time) * 1000, 2)

            # High-level content preview from top unit
            summary_content = record.get("content")
            if processed_units and not summary_content:
                summary_content = processed_units[0].get("content")

            summary_info = {
                "evidence_id": evidence_id,
                "case_id": case_id,
                "source_file": source_file,
                "modality": modality,
                "status": "processed",
                "processing_stage": "processed",
                "extracted_units_count": len(processed_units),
                "document_chunks_count": doc_chunks,
                "transcript_segments_count": transcript_segs,
                "video_events_count": video_evs,
                "image_observations_count": img_obs,
                "embedding_status": embedding_status,
                "processing_time_ms": elapsed_ms,
                "extraction_method_used": primary_method,
                "error_message": None
            }

            # Finalize DB state
            db = _load_db()
            if evidence_id in db["evidence"]:
                db["evidence"][evidence_id]["status"] = "analyzed"
                db["evidence"][evidence_id]["processing_stage"] = "processed"
                db["evidence"][evidence_id]["content"] = summary_content
                db["evidence"][evidence_id]["extracted_units"] = processed_units
                db["evidence"][evidence_id]["ai_summary"] = summary_info
                _save_db(db)

            return {
                "success": True,
                "evidence": db["evidence"][evidence_id],
                "summary": summary_info
            }

        except Exception as e:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            error_msg = str(e)
            
            # Record failure state
            db = _load_db()
            if evidence_id in db["evidence"]:
                db["evidence"][evidence_id]["status"] = "error"
                db["evidence"][evidence_id]["processing_stage"] = "processing_error"
                db["evidence"][evidence_id]["error_details"] = error_msg
                _save_db(db)

            summary_info = {
                "evidence_id": evidence_id,
                "case_id": case_id,
                "source_file": source_file,
                "modality": modality,
                "status": "processing_error",
                "processing_stage": "processing_error",
                "extracted_units_count": 0,
                "document_chunks_count": 0,
                "transcript_segments_count": 0,
                "video_events_count": 0,
                "image_observations_count": 0,
                "embedding_status": "failed",
                "processing_time_ms": elapsed_ms,
                "extraction_method_used": "error",
                "error_message": error_msg
            }

            return {
                "success": False,
                "evidence": db["evidence"][evidence_id],
                "summary": summary_info
            }

    def process_case_evidence(self, case_id: str) -> List[Dict[str, Any]]:
        db = _load_db()
        evidence_keys = [
            k for k, v in db["evidence"].items() if v.get("case_id") == case_id
        ]
        results = []
        for k in evidence_keys:
            res = self.process_evidence_item(k)
            results.append(res)
        return results

    def _update_stage(self, evidence_id: str, stage: str, status_val: str):
        db = _load_db()
        if evidence_id in db["evidence"]:
            db["evidence"][evidence_id]["processing_stage"] = stage
            db["evidence"][evidence_id]["status"] = status_val
            _save_db(db)
