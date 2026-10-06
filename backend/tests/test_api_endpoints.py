import sys
from pathlib import Path
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.main import app

client = TestClient(app)

def test_fastapi_endpoints():
    print("=== TESTING FASTAPI ENDPOINTS ===")

    print("[1] Testing Root & Health...")
    res = client.get("/health")
    assert res.status_code == 200
    print(f"  -> Health: {res.json()}")

    print("[2] Testing AI Health Endpoint...")
    res = client.get("/api/ai/health")
    assert res.status_code == 200
    print(f"  -> AI Health: {res.json()}")

    print("[3] Testing List Evidence Endpoint...")
    res = client.get("/api/evidence?case_id=CASE-001")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    print(f"  -> Listed {len(items)} evidence records for CASE-001.")

    print("[4] Testing Process Evidence Endpoint (EVD-002)...")
    res = client.post("/api/evidence/EVD-002/process")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    print(f"  -> Processed EVD-002: Stage={data['summary']['processing_stage']}, Units={data['summary']['extracted_units_count']}")

    print("[5] Testing Vector Retrieval Query Endpoint...")
    payload = {
        "query": "What does the witness statement say about the vehicle's position before impact?",
        "case_id": "CASE-001",
        "top_k": 3
    }
    res = client.post("/api/retrieval/query", json=payload)
    assert res.status_code == 200
    qdata = res.json()
    assert qdata["results_count"] > 0
    top = qdata["results"][0]
    print(f"  -> Query: '{qdata['query']}'")
    print(f"  -> Top Match: '{top['unit']['content']}'")
    print(f"  -> Provenance: '{top['source_provenance']}'")

    print("\n[OK] ALL FASTAPI ENDPOINT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_fastapi_endpoints()
