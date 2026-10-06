from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseDocumentProcessor(ABC):
    @abstractmethod
    def extract_document(
        self, file_path: str, source_file: str, case_id: str
    ) -> List[Dict[str, Any]]:
        """
        Extract page-level text, layout information, and structured evidence units from documents.
        """
        pass

class BaseAudioProcessor(ABC):
    @abstractmethod
    def transcribe_audio(
        self, file_path: str, source_file: str, case_id: str
    ) -> List[Dict[str, Any]]:
        """
        Transcribe audio into timestamped segments with optional speaker diarization.
        """
        pass

class BaseVideoProcessor(ABC):
    @abstractmethod
    def process_video(
        self, file_path: str, source_file: str, case_id: str
    ) -> List[Dict[str, Any]]:
        """
        Extract audio transcript + timestamped visual scene events from video.
        """
        pass

class BaseImageProcessor(ABC):
    @abstractmethod
    def analyze_image(
        self, file_path: str, source_file: str, case_id: str
    ) -> List[Dict[str, Any]]:
        """
        Analyze image to extract cautious visual observations and damage features.
        """
        pass

class BaseEmbeddingProvider(ABC):
    @abstractmethod
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embedding vectors for input texts.
        """
        pass

    @abstractmethod
    def embed_query(self, query: str) -> List[float]:
        """
        Generate embedding vector for a retrieval query.
        """
        pass

class BaseRerankingProvider(ABC):
    @abstractmethod
    def rerank(
        self, query: str, documents: List[str], top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Rerank document results given a query.
        """
        pass
