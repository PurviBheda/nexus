import httpx
from typing import List, Dict, Any, Optional
from app.ai.config import NVIDIA_API_KEY, NVIDIA_NIM_BASE_URL, NVIDIA_RERANKER_ENDPOINT, get_ai_status

class NVIDIARerankingProvider:
    """
    NVIDIA Reranking Provider using NeMo Retriever / Reranking NIM
    (e.g., nvidia/nv-rerankqa-mistral-4b-v3).
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or NVIDIA_API_KEY
        self.endpoint = NVIDIA_RERANKER_ENDPOINT
        self.base_url = NVIDIA_NIM_BASE_URL

    def rerank(
        self, query: str, documents: List[Dict[str, Any]], top_k: int = 5
    ) -> List[Dict[str, Any]]:
        if not documents:
            return []

        ai_status = get_ai_status()
        if ai_status["nvidia_configured"]:
            try:
                url = f"{self.base_url.rstrip('/')}/ranking"
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                passages = [doc.get("content", "") for doc in documents]
                payload = {
                    "model": self.endpoint,
                    "query": {"text": query},
                    "passages": [{"text": p} for p in passages]
                }
                with httpx.Client(timeout=15.0) as client:
                    resp = client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        rankings = data.get("rankings", [])
                        reranked = []
                        for item in rankings[:top_k]:
                            idx = item["index"]
                            doc = documents[idx].copy()
                            doc["rerank_score"] = item.get("logit", 0.9)
                            reranked.append(doc)
                        return reranked
            except Exception as e:
                print(f"[NVIDIARerankingProvider] Reranking warning: {e}")

        # Default fallback: return documents in original rank up to top_k
        return documents[:top_k]
