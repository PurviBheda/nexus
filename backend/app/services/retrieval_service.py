from typing import List, Dict, Any, Optional
from app.ai.retrieval.embeddings import NVIDIAEmbeddingProvider
from app.ai.retrieval.reranking import NVIDIARerankingProvider
from app.ai.retrieval.lancedb_store import LanceDBVectorStore

class RetrievalService:
    """
    Retrieval Service for querying indexed evidence units across modalities.
    Attaches exact source provenance (file + page or timestamp range).
    """
    def __init__(self):
        self.embedding_provider = NVIDIAEmbeddingProvider()
        self.reranking_provider = NVIDIARerankingProvider()
        self.vector_store = LanceDBVectorStore()

    def query(
        self,
        query_text: str,
        case_id: Optional[str] = "CASE-001",
        modality: Optional[str] = None,
        top_k: int = 5
    ) -> Dict[str, Any]:
        if not query_text or not query_text.strip():
            return {
                "query": query_text,
                "case_id": case_id,
                "results_count": 0,
                "results": []
            }

        # 1. Embed query text
        query_vector = self.embedding_provider.embed_query(query_text)

        # 2. Vector search in LanceDB
        raw_units = self.vector_store.query_similarity(
            query_vector=query_vector,
            case_id=case_id,
            modality=modality,
            top_k=top_k * 2  # fetch candidate pool
        )

        if not raw_units:
            return {
                "query": query_text,
                "case_id": case_id,
                "results_count": 0,
                "results": []
            }

        # 3. Optional Reranking with NVIDIA Reranker NIM
        reranked = self.reranking_provider.rerank(query_text, raw_units, top_k=top_k)

        # 4. Format provenance strings
        formatted_results = []
        for doc in reranked:
            provenance_str = self._format_provenance(doc)
            score = doc.get("rerank_score") or doc.get("score") or 0.85
            
            formatted_results.append({
                "unit": doc,
                "source_provenance": provenance_str,
                "relevance_score": round(float(score), 4)
            })

        return {
            "query": query_text,
            "case_id": case_id,
            "results_count": len(formatted_results),
            "results": formatted_results
        }

    def _format_provenance(self, unit: Dict[str, Any]) -> str:
        source = unit.get("source_file", "unknown")
        modality = unit.get("modality", "")
        page = unit.get("page")
        ts_start = unit.get("timestamp_start")
        ts_end = unit.get("timestamp_end")

        if modality == "document" and page:
            return f"{source} [Page {page}]"
        elif modality in ("audio", "video") and ts_start is not None and ts_end is not None:
            fmt_start = self._format_seconds(ts_start)
            fmt_end = self._format_seconds(ts_end)
            return f"{source} [{fmt_start} – {fmt_end}]"
        elif modality == "image":
            return f"{source} [Image Observation]"
        else:
            return f"{source}"

    def _format_seconds(self, seconds: float) -> str:
        mins = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{mins:02d}:{secs:02d}"
