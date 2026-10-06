import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import lancedb
from app.ai.config import get_lancedb_full_path

TABLE_NAME = "evidence_units"

class LanceDBVectorStore:
    """
    Vector Store managing indexing and similarity retrieval of structured evidence units using LanceDB.
    """
    def __init__(self):
        self.db_path = get_lancedb_full_path()
        self._db = None
        self._table = None

    def _get_db(self):
        if self._db is None:
            self._db = lancedb.connect(str(self.db_path))
        return self._db

    def add_evidence_units(self, units: List[Dict[str, Any]], vectors: List[List[float]]) -> int:
        if not units or not vectors or len(units) != len(vectors):
            return 0

        db = self._get_db()
        records = []
        for unit, vec in zip(units, vectors):
            record = {
                "id": unit.get("id") or f"unit_{unit.get('evidence_id')}_{unit.get('page') or unit.get('timestamp_start') or 0}",
                "evidence_id": unit.get("evidence_id", ""),
                "case_id": unit.get("case_id", "CASE-001"),
                "source_file": unit.get("source_file", ""),
                "modality": unit.get("modality", ""),
                "content": unit.get("content", ""),
                "timestamp_start": float(unit.get("timestamp_start")) if unit.get("timestamp_start") is not None else -1.0,
                "timestamp_end": float(unit.get("timestamp_end")) if unit.get("timestamp_end") is not None else -1.0,
                "page": int(unit.get("page")) if unit.get("page") is not None else -1,
                "speaker": unit.get("speaker") or "",
                "confidence": float(unit.get("confidence") or 0.9),
                "evidence_type": unit.get("evidence_type", "document_text"),
                "extraction_method": unit.get("extraction_method", "other"),
                "vector": vec
            }
            records.append(record)

        try:
            if TABLE_NAME in db.table_names():
                table = db.open_table(TABLE_NAME)
                table.add(records)
            else:
                table = db.create_table(TABLE_NAME, data=records)
            return len(records)
        except Exception as e:
            print(f"[LanceDBVectorStore] Error adding records to LanceDB: {e}")
            return 0

    def query_similarity(
        self,
        query_vector: List[float],
        case_id: Optional[str] = None,
        modality: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        db = self._get_db()
        if TABLE_NAME not in db.table_names():
            return []

        try:
            table = db.open_table(TABLE_NAME)
            query_builder = table.search(query_vector)

            filters = []
            if case_id:
                filters.append(f"case_id = '{case_id}'")
            if modality:
                filters.append(f"modality = '{modality}'")

            if filters:
                query_builder = query_builder.where(" AND ".join(filters))

            results = query_builder.limit(top_k).to_list()

            cleaned = []
            for r in results:
                ts_start = r["timestamp_start"] if r["timestamp_start"] >= 0 else None
                ts_end = r["timestamp_end"] if r["timestamp_end"] >= 0 else None
                pg = r["page"] if r["page"] >= 1 else None

                cleaned.append({
                    "id": r["id"],
                    "evidence_id": r["evidence_id"],
                    "case_id": r["case_id"],
                    "source_file": r["source_file"],
                    "modality": r["modality"],
                    "content": r["content"],
                    "timestamp_start": ts_start,
                    "timestamp_end": ts_end,
                    "page": pg,
                    "speaker": r["speaker"] if r["speaker"] else None,
                    "confidence": r["confidence"],
                    "evidence_type": r["evidence_type"],
                    "extraction_method": r["extraction_method"],
                    "score": round(float(r.get("_distance", 0.0)), 4)
                })
            return cleaned
        except Exception as e:
            print(f"[LanceDBVectorStore] Search error: {e}")
            return []

    def get_units_by_evidence_id(self, evidence_id: str) -> List[Dict[str, Any]]:
        db = self._get_db()
        if TABLE_NAME not in db.table_names():
            return []
        try:
            table = db.open_table(TABLE_NAME)
            results = table.search().where(f"evidence_id = '{evidence_id}'").to_list()
            cleaned = []
            for r in results:
                ts_start = r["timestamp_start"] if r["timestamp_start"] >= 0 else None
                ts_end = r["timestamp_end"] if r["timestamp_end"] >= 0 else None
                pg = r["page"] if r["page"] >= 1 else None
                cleaned.append({
                    "id": r["id"],
                    "evidence_id": r["evidence_id"],
                    "case_id": r["case_id"],
                    "source_file": r["source_file"],
                    "modality": r["modality"],
                    "content": r["content"],
                    "timestamp_start": ts_start,
                    "timestamp_end": ts_end,
                    "page": pg,
                    "speaker": r["speaker"] if r["speaker"] else None,
                    "confidence": r["confidence"],
                    "evidence_type": r["evidence_type"],
                    "extraction_method": r["extraction_method"]
                })
            return cleaned
        except Exception as e:
            print(f"[LanceDBVectorStore] get_units error: {e}")
            return []
