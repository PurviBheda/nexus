import hashlib
import math
from typing import List
from app.ai.providers.nvidia_nim import NVIDIANIMClient
from app.ai.config import NVIDIA_EMBEDDING_ENDPOINT, get_ai_status

EMBEDDING_DIM = 384

class NVIDIAEmbeddingProvider:
    """
    Embedding Provider supporting NVIDIA NeMo Retriever / NIM embedding endpoints
    (e.g., nvidia/nv-embedqa-e5-v5) with deterministic local vector fallback.
    """
    def __init__(self):
        self.nim_client = NVIDIANIMClient()
        self.model = NVIDIA_EMBEDDING_ENDPOINT

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        ai_status = get_ai_status()
        if ai_status["nvidia_configured"]:
            try:
                return self.nim_client.generate_embeddings(
                    model=self.model, input_texts=texts, input_type="passage"
                )
            except Exception as e:
                print(f"[NVIDIAEmbeddingProvider] NVIDIA Embedding error: {e}. Using deterministic vector fallback.")

        return [self._deterministic_vector(t) for t in texts]

    def embed_query(self, query: str) -> List[float]:
        ai_status = get_ai_status()
        if ai_status["nvidia_configured"]:
            try:
                res = self.nim_client.generate_embeddings(
                    model=self.model, input_texts=[query], input_type="query"
                )
                if res:
                    return res[0]
            except Exception as e:
                print(f"[NVIDIAEmbeddingProvider] Query embedding error: {e}. Using deterministic fallback.")

        return self._deterministic_vector(query)

    def _deterministic_vector(self, text: str, dim: int = EMBEDDING_DIM) -> List[float]:
        """
        Generates a deterministic 384-dim normalized vector representation of text
        for vector similarity testing in LanceDB when offline/unconfigured.
        """
        words = text.lower().split()
        vec = [0.0] * dim
        
        for idx, word in enumerate(words):
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            pos = h % dim
            val = ((h >> 8) % 1000) / 1000.0 - 0.5
            vec[pos] += val * (1.0 / (idx + 1.0))

        # Add character n-gram features
        for i in range(len(text) - 2):
            trigram = text[i:i+3].lower()
            h = int(hashlib.sha256(trigram.encode("utf-8")).hexdigest(), 16)
            pos = h % dim
            vec[pos] += 0.1

        # Normalize vector
        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0:
            vec = [v / norm for v in vec]
        else:
            vec[0] = 1.0
        return vec
