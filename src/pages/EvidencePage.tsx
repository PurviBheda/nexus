import { useState, useEffect, useCallback, useMemo } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Icon from "../components/ui/Icon";
import { CORE_EVIDENCE_ITEMS } from "../data/case001";
import type { IconName, EvidenceItem } from "../types";
import {
  fetchCaseEvidenceList,
  processEvidenceItem,
  processAllCaseEvidence,
  fetchEvidenceUnits,
  queryRetrieval,
  AIUnitRecord,
  RetrievalResultItem
} from "../services/api";

export default function EvidencePage() {
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>(CORE_EVIDENCE_ITEMS);
  const [selected, setSelected] = useState(0);
  const [filterQuery, setFilterQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatusMsg, setProcessingStatusMsg] = useState("");

  // AI Units Drawer State
  const [unitsDrawerOpen, setUnitsDrawerOpen] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<AIUnitRecord[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Backend Retrieval Test State
  const [searchQuery, setSearchQuery] = useState("");
  const [retrievalResults, setRetrievalResults] = useState<RetrievalResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const loadEvidence = useCallback(async () => {
    try {
      const items = await fetchCaseEvidenceList("CASE-001");
      if (items && items.length > 0) {
        setEvidenceItems(items);
      }
    } catch {
      // Keep initial seed items if server unavailable
    }
  }, []);

  useEffect(() => {
    loadEvidence();
  }, [loadEvidence]);

  const filteredItems = useMemo(() => {
    if (!filterQuery.trim()) return evidenceItems;
    const q = filterQuery.toLowerCase();
    return evidenceItems.filter(
      (item) =>
        item.sourceFile.toLowerCase().includes(q) ||
        item.modality.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q)
    );
  }, [evidenceItems, filterQuery]);

  const selectedItem = filteredItems[selected] || filteredItems[0] || evidenceItems[0];

  const handleProcessItem = async (evidenceId: string) => {
    setIsProcessing(true);
    setProcessingStatusMsg(`Processing '${evidenceId}' through NVIDIA AI Pipeline...`);
    try {
      const updated = await processEvidenceItem(evidenceId);
      setEvidenceItems((prev) => prev.map((item) => (item.id === evidenceId ? updated : item)));
      setProcessingStatusMsg(`Successfully processed '${updated.sourceFile}'!`);
      // Reload units if drawer is open
      if (unitsDrawerOpen) {
        loadUnits(evidenceId);
      }
    } catch (err: any) {
      setProcessingStatusMsg(`Processing error: ${err.message || "Failed"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessAll = async () => {
    setIsProcessing(true);
    setProcessingStatusMsg("Batch processing all CASE-001 evidence via NVIDIA AI Pipeline...");
    try {
      await processAllCaseEvidence("CASE-001");
      await loadEvidence();
      setProcessingStatusMsg("All case evidence successfully processed & indexed in LanceDB!");
    } catch (err: any) {
      setProcessingStatusMsg(`Batch processing error: ${err.message || "Failed"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadUnits = async (evidenceId: string) => {
    setLoadingUnits(true);
    try {
      const units = await fetchEvidenceUnits(evidenceId);
      setSelectedUnits(units);
    } catch {
      setSelectedUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleOpenUnitsDrawer = (evidenceId: string) => {
    setUnitsDrawerOpen(true);
    loadUnits(evidenceId);
  };

  const handleRetrievalTest = async (queryText?: string) => {
    const q = queryText || searchQuery;
    if (!q.trim()) return;
    setIsSearching(true);
    try {
      const res = await queryRetrieval(q, "CASE-001");
      setRetrievalResults(res.results || []);
    } catch (err: any) {
      console.error("Retrieval error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="content evidence-content">
      {/* Top Banner / Processing Status Header */}
      <div style={{
        marginBottom: "1rem",
        padding: "1rem 1.25rem",
        background: "rgba(15, 23, 42, 0.8)",
        border: "1px solid rgba(59, 130, 246, 0.3)",
        borderRadius: "12px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #76b900 0%, #005f73 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px"
          }}>
            NV
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>
              NVIDIA AI Pipeline & Multimodal Processing Engine
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              {processingStatusMsg || "Connected to hosted NVIDIA NIM, ASR, VLM & NeMo Retriever with LanceDB indexing."}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            className="icon-button subtle"
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              background: "#76b900",
              color: "#000",
              fontWeight: 700,
              border: "none",
              cursor: isProcessing ? "not-allowed" : "pointer"
            }}
            onClick={handleProcessAll}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Process All (NVIDIA AI)"}
          </button>
        </div>
      </div>

      <div className="evidence-layout">
        {/* Evidence List Panel */}
        <Card className="evidence-list-panel">
          <div className="panel-heading">
            <div>
              <span>EVIDENCE REPOSITORY</span>
              <strong>{evidenceItems.length} items</strong>
            </div>
          </div>
          <label className="list-search">
            <Icon name="search" />
            <input
              placeholder="Filter evidence files…"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </label>
          <div className="evidence-list">
            {filteredItems.map((item, index) => (
              <button
                className={selected === index ? "selected" : ""}
                key={item.id}
                onClick={() => setSelected(index)}
              >
                <div className={`file-icon type-${item.modality}`}>
                  <Icon name={item.modality === "document" ? "doc" : (item.modality as IconName)} />
                </div>
                <div>
                  <strong>{item.sourceFile}</strong>
                  <span>{item.meta}</span>
                  <small style={{
                    color: item.processingStage === "processed"
                      ? "#10b981"
                      : item.processingStage === "ready_for_ai"
                      ? "#a855f7"
                      : "#3b82f6"
                  }}>
                    <i className="status-dot" />{" "}
                    {item.processingStage ? item.processingStage.toUpperCase() : item.status}
                  </small>
                </div>
                <Icon name="chevron" />
              </button>
            ))}
          </div>
        </Card>

        {/* Media / Document Viewer & AI Actions Panel */}
        <Card className="viewer-panel">
          <div className="viewer-header">
            <div>
              <Badge tone={selectedItem?.tone || "blue"}>{selectedItem?.modality?.toUpperCase()}</Badge>
              <strong>{selectedItem?.sourceFile}</strong>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                style={{
                  background: "rgba(118, 185, 0, 0.15)",
                  color: "#76b900",
                  border: "1px solid rgba(118, 185, 0, 0.4)",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: isProcessing ? "not-allowed" : "pointer"
                }}
                onClick={() => handleProcessItem(selectedItem.id)}
                disabled={isProcessing}
              >
                Process with NVIDIA AI
              </button>
              <button
                style={{
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#60a5fa",
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
                onClick={() => handleOpenUnitsDrawer(selectedItem.id)}
              >
                View AI Units ({selectedItem?.rawMetadata?.units_count || 3})
              </button>
            </div>
          </div>

          <div className="video-viewer">
            <div className="camera-overlay top">
              <span>CAM 04 · MARKET ST & 5TH AVE</span>
              <span>2025-01-14 18:42:17.084</span>
            </div>
            <div className="road-scene">
              <div className="road-line r1" />
              <div className="road-line r2" />
              <div className="vehicle vehicle-a">
                <span>VEHICLE A</span>
              </div>
              <div className="vehicle vehicle-b">
                <span>VEHICLE B</span>
              </div>
              <div className="tracking-box">
                <i>OBJECT 02 · {selectedItem?.confidence}%</i>
              </div>
            </div>
            <div className="camera-overlay bottom">
              <span>NVIDIA NIM · MULTIMODAL INGESTION</span>
              <span>STAGE: {(selectedItem?.processingStage || "ready_for_ai").toUpperCase()}</span>
            </div>
            <button className="play-button" aria-label="Play">
              <Icon name="play" size={22} />
            </button>
          </div>

          <div className="analysis-tabs">
            <button className="active">Extracted Intelligence & Content</button>
            <button onClick={() => handleOpenUnitsDrawer(selectedItem.id)}>
              AI Chunks & Provenance <Badge tone="green">LanceDB Indexed</Badge>
            </button>
          </div>

          <div className="transcript" style={{ maxHeight: "160px", overflowY: "auto" }}>
            <time>CONTENT SUMMARY</time>
            <p className="active">{selectedItem?.content}</p>
            <time>PIPELINE STAGE</time>
            <p>
              Processing Stage: <strong style={{ color: "#10b981" }}>{selectedItem?.processingStage || "ready_for_ai"}</strong> · Source: {selectedItem?.sourceFile}
            </p>
          </div>

          {/* Interactive Backend Vector Retrieval Test Panel */}
          <div style={{
            marginTop: "1.25rem",
            padding: "1rem",
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: "10px"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.5rem" }}>
              🔍 BACKEND VECTOR RETRIEVAL TEST (LANCEDB + NVIDIA EMBEDDINGS)
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <input
                type="text"
                placeholder="Ask retrieval engine (e.g. 'vehicle position before impact')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRetrievalTest()}
                style={{
                  flex: 1,
                  padding: "0.5rem 0.75rem",
                  background: "rgba(30, 41, 59, 0.8)",
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                  borderRadius: "6px",
                  color: "#f8fafc",
                  fontSize: "13px"
                }}
              />
              <button
                onClick={() => handleRetrievalTest()}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: isSearching ? "wait" : "pointer"
                }}
              >
                {isSearching ? "Searching..." : "Query Vector DB"}
              </button>
            </div>

            {/* Quick Demo Test Query Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "11px", color: "#94a3b8", alignSelf: "center" }}>Preset Tests:</span>
              <button
                onClick={() => {
                  setSearchQuery("What does the witness statement say about the vehicle's position before impact?");
                  handleRetrievalTest("What does the witness statement say about the vehicle's position before impact?");
                }}
                style={{
                  padding: "0.2rem 0.5rem",
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "4px",
                  color: "#93c5fd",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                Witness Statement Query
              </button>
              <button
                onClick={() => {
                  setSearchQuery("What time did the police report say the collision occurred?");
                  handleRetrievalTest("What time did the police report say the collision occurred?");
                }}
                style={{
                  padding: "0.2rem 0.5rem",
                  background: "rgba(168, 85, 247, 0.15)",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  borderRadius: "4px",
                  color: "#c084fc",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                Police Report Query
              </button>
            </div>

            {/* Retrieval Query Results Output */}
            {retrievalResults.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {retrievalResults.map((res, idx) => (
                  <div key={idx} style={{
                    padding: "0.6rem 0.8rem",
                    background: "rgba(30, 41, 59, 0.6)",
                    borderLeft: "3px solid #76b900",
                    borderRadius: "4px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#76b900", fontWeight: 700 }}>
                      <span>SOURCE PROVENANCE: {res.source_provenance}</span>
                      <span>Score: {(res.relevance_score * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#e2e8f0", marginTop: "0.2rem" }}>
                      "{res.unit.content}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Inspector Panel */}
        <Card className="metadata-panel">
          <div className="panel-heading">
            <div>
              <span>INSPECTOR</span>
              <strong>NVIDIA AI Provenance</strong>
            </div>
          </div>
          <div className="confidence-block">
            <span>EXTRACTION CONFIDENCE</span>
            <strong>{selectedItem?.confidence || 90}%</strong>
            <div>
              <i style={{ width: `${selectedItem?.confidence || 90}%` }} />
            </div>
            <small>Traceable to source provenance</small>
          </div>

          <div className="metadata-group">
            <div className="metadata-title">NVIDIA PIPELINE DETAILS</div>
            <div className="metadata-row">
              <span>Source File</span>
              <strong>{selectedItem?.sourceFile}</strong>
            </div>
            <div className="metadata-row">
              <span>Modality</span>
              <strong>{selectedItem?.modality}</strong>
            </div>
            <div className="metadata-row">
              <span>Processing Stage</span>
              <strong style={{ color: "#10b981" }}>
                {(selectedItem?.processingStage || "ready_for_ai").toUpperCase()}
              </strong>
            </div>
            <div className="metadata-row">
              <span>Vector Store</span>
              <strong style={{ color: "#60a5fa" }}>LanceDB Index</strong>
            </div>
            <div className="metadata-row">
              <span>Provenance</span>
              <strong>Preserved</strong>
            </div>
          </div>

          <button
            style={{
              width: "100%",
              marginTop: "1rem",
              padding: "0.6rem",
              background: "rgba(118, 185, 0, 0.15)",
              color: "#76b900",
              border: "1px solid rgba(118, 185, 0, 0.4)",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer"
            }}
            onClick={() => handleOpenUnitsDrawer(selectedItem.id)}
          >
            Inspect Structured Units & Provenance
          </button>
        </Card>
      </div>

      {/* AI Units Modal / Drawer */}
      {unitsDrawerOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            width: "680px",
            maxHeight: "80vh",
            background: "#0f172a",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            borderRadius: "16px",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "16px" }}>
                  Extracted Evidence Units — {selectedItem?.sourceFile}
                </h3>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Multimodal chunks & exact page/timestamp provenance
                </span>
              </div>
              <button
                onClick={() => setUnitsDrawerOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "20px",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {loadingUnits ? (
                <div style={{ color: "#94a3b8", padding: "1rem", textAlign: "center" }}>
                  Loading evidence units from backend...
                </div>
              ) : selectedUnits.length === 0 ? (
                <div style={{ color: "#94a3b8", padding: "1rem", textAlign: "center" }}>
                  No extracted units found yet. Click 'Process with NVIDIA AI' to extract page/timestamp units.
                </div>
              ) : (
                selectedUnits.map((unit, idx) => (
                  <div key={idx} style={{
                    padding: "0.85rem 1rem",
                    background: "rgba(30, 41, 59, 0.7)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "8px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "0.35rem" }}>
                      <span style={{ color: "#76b900", fontWeight: 700 }}>
                        {unit.modality === "document" && unit.page ? `PAGE ${unit.page}` : ""}
                        {unit.modality === "audio" || unit.modality === "video" ? `TIMESTAMP: ${unit.timestamp_start}s – ${unit.timestamp_end}s` : ""}
                        {unit.modality === "image" ? "VISUAL OBSERVATION" : ""}
                        {unit.speaker ? ` · Speaker: ${unit.speaker}` : ""}
                      </span>
                      <span style={{ color: "#94a3b8" }}>
                        Method: <code style={{ color: "#60a5fa" }}>{unit.extraction_method}</code>
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#f1f5f9", lineHeight: "1.4" }}>
                      "{unit.content}"
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748b", marginTop: "0.35rem" }}>
                      Unit ID: {unit.id} · Case: {unit.case_id}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setUnitsDrawerOpen(false)}
                style={{
                  padding: "0.5rem 1.25rem",
                  background: "#334155",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
