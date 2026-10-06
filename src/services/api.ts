import type { EvidenceItem, Modality, EvidenceTone, EvidenceStatus } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface UploadProgressCallback {
  (stage: "UPLOADING" | "UPLOADED" | "VALIDATING" | "METADATA_EXTRACTED" | "READY_FOR_AI" | "ERROR", progressPercent: number, errorMsg?: string): void;
}

export interface BackendEvidenceRecord {
  id: string;
  case_id: string;
  source_file: string;
  modality: string;
  file_type: string;
  file_size: number;
  status: string;
  processing_stage: string;
  storage_path?: string;
  content?: string;
  timestamp_start?: string;
  timestamp_end?: string;
  page?: number;
  speaker?: string;
  confidence?: number;
  created_at: string;
  metadata?: Record<string, any>;
  relationships?: Array<{ type: string; target: string; confidence: number }>;
}

export interface AIUnitRecord {
  id: string;
  evidence_id: string;
  case_id: string;
  source_file: string;
  modality: string;
  content: string;
  timestamp_start?: number;
  timestamp_end?: number;
  page?: number;
  speaker?: string;
  confidence?: number;
  evidence_type: string;
  extraction_method: string;
  created_at?: string;
}

export interface RetrievalResultItem {
  unit: AIUnitRecord;
  source_provenance: string;
  relevance_score: number;
}

export interface RetrievalResponse {
  query: string;
  case_id?: string;
  results_count: number;
  results: RetrievalResultItem[];
}

export function mapBackendRecordToEvidenceItem(rec: BackendEvidenceRecord): EvidenceItem {
  const modality: Modality = (["video", "audio", "document", "image"].includes(rec.modality)
    ? rec.modality
    : "document") as Modality;

  let tone: EvidenceTone = "blue";
  if (rec.processing_stage === "processed" || rec.status === "analyzed") {
    tone = "green";
  } else if (rec.processing_stage === "ready_for_ai") {
    tone = "blue";
  } else if (["processing_ai", "extracting", "structuring", "embedding"].includes(rec.processing_stage)) {
    tone = "amber";
  } else if (rec.processing_stage === "processing_error" || rec.status === "error") {
    tone = "red";
  }

  // Format meta string
  const metaParts: string[] = [];
  if (rec.metadata) {
    if (rec.metadata.duration_formatted) metaParts.push(rec.metadata.duration_formatted);
    if (rec.metadata.resolution) metaParts.push(rec.metadata.resolution);
    if (rec.metadata.dimensions) metaParts.push(rec.metadata.dimensions);
    if (rec.metadata.page_count) metaParts.push(`${rec.metadata.page_count} pages`);
    if (rec.metadata.file_size_formatted) {
      metaParts.push(rec.metadata.file_size_formatted);
    }
  }

  if (metaParts.length === 0 && rec.file_size) {
    metaParts.push(formatBytes(rec.file_size));
  }

  let displayStatus: EvidenceStatus = "Analyzed";
  if (rec.processing_stage === "ready_for_ai") {
    displayStatus = "Verified";
  } else if (rec.processing_stage === "processed") {
    displayStatus = "Analyzed";
  } else if (["processing_ai", "extracting", "structuring", "embedding"].includes(rec.processing_stage)) {
    displayStatus = "Processing";
  } else if (rec.processing_stage === "processing_error") {
    displayStatus = "Requires Review";
  }

  return {
    id: rec.id,
    caseId: rec.case_id,
    sourceFile: rec.source_file,
    modality: modality,
    content: rec.content || `Uploaded ${modality} evidence prepared for NVIDIA AI processing.`,
    timestampStart: rec.timestamp_start,
    timestampEnd: rec.timestamp_end,
    page: rec.page,
    speaker: rec.speaker,
    confidence: rec.confidence || 90,
    status: displayStatus,
    tone: tone,
    meta: metaParts.join(" · ") || rec.file_type,
    fileSize: rec.metadata?.file_size_formatted || formatBytes(rec.file_size),
    duration: rec.metadata?.duration_formatted,
    resolution: rec.metadata?.resolution || rec.metadata?.dimensions,
    hash: rec.id.slice(0, 16),
    addedBy: "Investigator",
    uploadedAt: new Date(rec.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    processingStage: rec.processing_stage,
    fileType: rec.file_type,
    storagePath: rec.storage_path,
    rawMetadata: rec.metadata,
    relationships: (rec.relationships || []).map(r => ({
      type: r.type as "SUPPORTS" | "CONTRADICTS" | "RELATED_TO",
      target: r.target,
      confidence: r.confidence
    }))
  };
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export async function uploadEvidenceFile(
  file: File,
  caseId: string = "CASE-001",
  onStatusUpdate?: UploadProgressCallback
): Promise<EvidenceItem> {
  onStatusUpdate?.("UPLOADING", 15);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("case_id", caseId);

  try {
    onStatusUpdate?.("VALIDATING", 40);

    const response = await fetch(`${API_BASE_URL}/evidence/upload`, {
      method: "POST",
      body: formData,
    });

    onStatusUpdate?.("METADATA_EXTRACTED", 75);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Upload failed" }));
      const msg = errorData.detail || `Upload failed with status ${response.status}`;
      onStatusUpdate?.("ERROR", 100, msg);
      throw new Error(msg);
    }

    const data = await response.json();
    onStatusUpdate?.("READY_FOR_AI", 100);

    return mapBackendRecordToEvidenceItem(data.evidence);
  } catch (err: any) {
    const errorMsg = err.message || "Failed to upload file to backend.";
    onStatusUpdate?.("ERROR", 100, errorMsg);
    throw err;
  }
}

export async function fetchCaseEvidenceList(caseId: string = "CASE-001"): Promise<EvidenceItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/investigations/${caseId}/evidence`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: BackendEvidenceRecord[] = await res.json();
    return data.map(mapBackendRecordToEvidenceItem);
  } catch (err) {
    console.warn("Could not fetch from FastAPI backend:", err);
    throw err;
  }
}

export async function processEvidenceItem(evidenceId: string): Promise<EvidenceItem> {
  const res = await fetch(`${API_BASE_URL}/evidence/${evidenceId}/process`, {
    method: "POST"
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Processing failed" }));
    throw new Error(err.detail || "AI processing request failed.");
  }
  const data = await res.json();
  return mapBackendRecordToEvidenceItem(data.evidence);
}

export async function processAllCaseEvidence(caseId: string = "CASE-001"): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/investigations/${caseId}/process-all`, {
    method: "POST"
  });
  if (!res.ok) {
    throw new Error("Failed to process case evidence batch.");
  }
}

export async function fetchEvidenceUnits(evidenceId: string): Promise<AIUnitRecord[]> {
  const res = await fetch(`${API_BASE_URL}/evidence/${evidenceId}/units`);
  if (!res.ok) throw new Error("Failed to fetch evidence units.");
  return res.json();
}

export async function fetchAIHealth(): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE_URL}/ai/health`);
  if (!res.ok) throw new Error("Failed to fetch AI health.");
  return res.json();
}

export async function queryRetrieval(
  query: string,
  caseId: string = "CASE-001",
  modality?: string
): Promise<RetrievalResponse> {
  const res = await fetch(`${API_BASE_URL}/retrieval/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, case_id: caseId, modality, top_k: 5 })
  });
  if (!res.ok) throw new Error("Retrieval query failed.");
  return res.json();
}
