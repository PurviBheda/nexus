import sys
import os
from pathlib import Path

# Ensure backend root is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.ai.config import get_ai_status
from app.ai.pipelines.document_pipeline import DocumentPipeline
from app.ai.pipelines.audio_pipeline import AudioPipeline
from app.ai.pipelines.video_pipeline import VideoPipeline
from app.ai.pipelines.image_pipeline import ImagePipeline
from app.ai.retrieval.embeddings import NVIDIAEmbeddingProvider
from app.ai.retrieval.lancedb_store import LanceDBVectorStore
from app.services.ai_processing_service import AIProcessingService
from app.services.retrieval_service import RetrievalService

def run_all_tests():
    print("=== RUNNING NEXUS AI PIPELINE TEST SUITE ===")

    print("[Test 1/7] Testing NVIDIA Configuration & Health Check...")
    status = get_ai_status()
    assert "nvidia_configured" in status
    assert "active_mode" in status
    print(f"  -> Config Status: {status}")

    print("[Test 2/7] Testing Document Pipeline Page Provenance...")
    doc_pipeline = DocumentPipeline()
    doc_units = doc_pipeline.process(
        file_path="storage/uploads/CASE-001/police_report.pdf",
        source_file="police_report.pdf",
        case_id="CASE-001",
        evidence_id="EVD-003"
    )
    assert len(doc_units) > 0
    print(f"  -> Extracted {len(doc_units)} document units. Sample page: Page {doc_units[0].get('page')}")

    print("[Test 3/7] Testing Audio Pipeline Timestamp Provenance...")
    audio_pipeline = AudioPipeline()
    audio_units = audio_pipeline.process(
        file_path="storage/uploads/CASE-001/witness_statement.wav",
        source_file="witness_statement.wav",
        case_id="CASE-001",
        evidence_id="EVD-002"
    )
    assert len(audio_units) > 0
    print(f"  -> Extracted {len(audio_units)} audio units. Sample timestamp: {audio_units[0].get('timestamp_start')}s")

    print("[Test 4/7] Testing Video Pipeline Timestamp Provenance...")
    video_pipeline = VideoPipeline()
    video_units = video_pipeline.process(
        file_path="storage/uploads/CASE-001/CCTV_intersection.mp4",
        source_file="CCTV_intersection.mp4",
        case_id="CASE-001",
        evidence_id="EVD-001"
    )
    assert len(video_units) > 0
    print(f"  -> Extracted {len(video_units)} video events. Sample timestamp: {video_units[0].get('timestamp_start')}s")

    print("[Test 5/7] Testing Image Pipeline Visual Observation...")
    image_pipeline = ImagePipeline()
    image_units = image_pipeline.process(
        file_path="storage/uploads/CASE-001/vehicle_damage_01.jpg",
        source_file="vehicle_damage_01.jpg",
        case_id="CASE-001",
        evidence_id="EVD-006"
    )
    assert len(image_units) > 0
    print(f"  -> Extracted {len(image_units)} image observation. Content: '{image_units[0]['content'][:60]}...'")

    print("[Test 6/7] Testing Vector Embeddings & LanceDB Store...")
    emb_provider = NVIDIAEmbeddingProvider()
    q_vec = emb_provider.embed_query("stationary before impact")
    assert len(q_vec) == 384
    store = LanceDBVectorStore()
    test_unit = {
        "id": "test_unit_audio_001",
        "evidence_id": "EVD-002",
        "case_id": "CASE-001",
        "source_file": "witness_statement.wav",
        "modality": "audio",
        "content": "The vehicle was stationary before impact.",
        "timestamp_start": 138.0,
        "timestamp_end": 151.0,
        "speaker": "Elena R. (Witness)",
        "confidence": 0.94,
        "evidence_type": "transcript",
        "extraction_method": "mock_fallback"
    }
    store.add_evidence_units([test_unit], [q_vec])
    search_res = store.query_similarity(q_vec, case_id="CASE-001", top_k=1)
    assert len(search_res) > 0
    print(f"  -> LanceDB Search Returned: {search_res[0]['source_file']} (Distance: {search_res[0].get('score')})")

    print("[Test 7/7] Testing End-to-End AI Processing & Retrieval Query...")
    ai_service = AIProcessingService()
    process_res = ai_service.process_evidence_item("EVD-002")
    assert process_res["success"] is True
    print(f"  -> EVD-002 Processing Summary: Stage='{process_res['summary']['processing_stage']}', Units={process_res['summary']['extracted_units_count']}")

    # Process all CASE-001 evidence
    all_res = ai_service.process_case_evidence("CASE-001")
    print(f"  -> Batch Processed {len(all_res)} items for CASE-001.")

    retrieval_service = RetrievalService()
    query_result = retrieval_service.query(
        query_text="What does the witness statement say about the vehicle's position before impact?",
        case_id="CASE-001"
    )
    assert query_result["results_count"] > 0
    print(f"  -> Query: '{query_result['query']}'")
    print(f"  -> Top Match Content: '{query_result['results'][0]['unit']['content']}'")
    print(f"  -> Source Provenance: '{query_result['results'][0]['source_provenance']}'")

    doc_query = retrieval_service.query(
        query_text="What time did the police report say the collision occurred?",
        case_id="CASE-001"
    )
    assert doc_query["results_count"] > 0
    print(f"  -> Query: '{doc_query['query']}'")
    print(f"  -> Top Match Content: '{doc_query['results'][0]['unit']['content']}'")
    print(f"  -> Source Provenance: '{doc_query['results'][0]['source_provenance']}'")

    print("\n[OK] ALL 7 AI PIPELINE TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_all_tests()
