import { useState, useRef, useEffect, useCallback } from "react";
import Card, { CardHeader } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import { CORE_EVIDENCE_ITEMS } from "../data/case001";
import type { Screen, IconName, EvidenceItem } from "../types";
import { uploadEvidenceFile, fetchCaseEvidenceList } from "../services/api";

interface QueueItem {
  id: string;
  filename: string;
  sizeFormatted: string;
  modality: "video" | "audio" | "document" | "image";
  stage: "UPLOADING" | "UPLOADED" | "VALIDATING" | "METADATA_EXTRACTED" | "READY_FOR_AI" | "ERROR";
  progressPercent: number;
  errorMsg?: string;
  resultRecord?: EvidenceItem;
}

export default function UploadPage({
  setScreen,
}: {
  setScreen: (screen: Screen) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(CORE_EVIDENCE_ITEMS);
  const [activeQueue, setActiveQueue] = useState<QueueItem[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load backend evidence on mount
  const loadEvidence = useCallback(async () => {
    try {
      const items = await fetchCaseEvidenceList("CASE-001");
      if (items && items.length > 0) {
        setEvidenceList(items);
      }
    } catch {
      // Keep initial seed state if offline
    }
  }, []);

  useEffect(() => {
    loadEvidence();
  }, [loadEvidence]);

  const detectModality = (filename: string): "video" | "audio" | "document" | "image" => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["pdf"].includes(ext || "")) return "document";
    if (["wav", "mp3", "m4a", "ogg"].includes(ext || "")) return "audio";
    if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext || "")) return "video";
    if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) return "image";
    return "document";
  };

  const handleFiles = async (files: FileList | File[]) => {
    setUploadError(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    for (const file of fileArray) {
      const tempId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const modality = detectModality(file.name);
      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

      const queueItem: QueueItem = {
        id: tempId,
        filename: file.name,
        sizeFormatted: formattedSize,
        modality,
        stage: "UPLOADING",
        progressPercent: 15,
      };

      setActiveQueue((prev) => [queueItem, ...prev]);

      try {
        const item = await uploadEvidenceFile(file, "CASE-001", (stage, percent, errorMsg) => {
          setActiveQueue((prev) =>
            prev.map((q) =>
              q.id === tempId
                ? { ...q, stage, progressPercent: percent, errorMsg }
                : q
            )
          );
        });

        // Add to main evidence list
        setEvidenceList((prev) => [item, ...prev.filter((x) => x.id !== item.id)]);

        // Update queue item
        setActiveQueue((prev) =>
          prev.map((q) =>
            q.id === tempId
              ? { ...q, stage: "READY_FOR_AI", progressPercent: 100, resultRecord: item }
              : q
          )
        );
      } catch (err: any) {
        setUploadError(err.message || "Upload failed");
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const clearQueue = () => {
    setActiveQueue([]);
    setUploadError(null);
  };

  const removeQueueItem = (id: string) => {
    setActiveQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Combine active queue and persisted items for display
  const totalCount = evidenceList.length;

  return (
    <div className="content">
      <div className="stepper">
        <div className="complete">
          <b>
            <Icon name="check" />
          </b>
          <span>CASE DETAILS</span>
        </div>
        <i />
        <div className="active">
          <b>2</b>
          <span>UPLOAD EVIDENCE</span>
        </div>
        <i />
        <div>
          <b>3</b>
          <span>REVIEW & ANALYZE</span>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        multiple
        accept=".pdf,.wav,.mp3,.m4a,.ogg,.mp4,.mov,.avi,.mkv,.webm,.jpg,.jpeg,.png,.webp"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
      />

      <Card className={`upload-card ${isDragging ? "dragging" : ""}`}>
        <div
          className="dropzone"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          style={{
            borderColor: isDragging ? "var(--color-accent-green, #10b981)" : undefined,
            background: isDragging ? "rgba(16, 185, 129, 0.05)" : undefined,
            transition: "all 0.2s ease"
          }}
        >
          <div className="upload-graphic">
            <Icon name="upload" size={25} />
          </div>
          <div className="card-title">
            {isDragging ? "Drop files to start ingestion" : "Drop evidence files here"}
          </div>
          <p>Documents (PDF), Audio (WAV, MP3, M4A, OGG), Video (MP4, MOV, AVI, MKV, WEBM), Images (JPG, PNG, WEBP)</p>
          <Button onClick={() => fileInputRef.current?.click()}>Browse files</Button>
          <small>Maximum 10 GB per file · Multimodal Metadata Ingestion Active</small>
        </div>
      </Card>

      {uploadError && (
        <Card style={{ marginTop: 12, padding: "12px 16px", borderColor: "rgba(239, 68, 68, 0.4)", background: "rgba(239, 68, 68, 0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ef4444", fontSize: 13, fontWeight: 500 }}>
            <Icon name="alert" size={16} />
            <span>{uploadError}</span>
          </div>
        </Card>
      )}

      <Card style={{ marginTop: 16 }}>
        <CardHeader
          title="Upload queue & Ingested Evidence"
          eyebrow={`${totalCount} FILES IN CASE-001`}
          action={
            activeQueue.length > 0 ? (
              <button className="text-button muted" onClick={clearQueue}>
                Clear queue
              </button>
            ) : null
          }
        />

        <div className="file-list">
          {/* Active upload queue items */}
          {activeQueue.map((item) => (
            <div className="file-row" key={item.id}>
              <div className={`file-icon type-${item.modality}`}>
                <Icon name={item.modality === "document" ? "doc" : (item.modality as IconName)} />
              </div>
              <div className="file-info">
                <strong>{item.filename}</strong>
                <span>
                  {item.sizeFormatted} ·{" "}
                  {item.stage === "UPLOADING" && "Uploading to NEXUS server..."}
                  {item.stage === "VALIDATING" && "Validating MIME & Magic Header..."}
                  {item.stage === "METADATA_EXTRACTED" && "Extracting technical metadata..."}
                  {item.stage === "READY_FOR_AI" && "Ingestion complete · Ready for AI processing"}
                  {item.stage === "ERROR" && (item.errorMsg || "Upload failed")}
                </span>
                {item.stage !== "READY_FOR_AI" && item.stage !== "ERROR" && (
                  <div className="processing-line">
                    <i style={{ width: `${item.progressPercent}%` }} />
                  </div>
                )}
              </div>
              <Badge
                tone={
                  item.stage === "READY_FOR_AI"
                    ? "green"
                    : item.stage === "ERROR"
                    ? "red"
                    : "amber"
                }
              >
                {item.stage === "READY_FOR_AI" && <Icon name="check" />}
                {item.stage === "READY_FOR_AI"
                  ? "READY FOR AI"
                  : item.stage === "ERROR"
                  ? "ERROR"
                  : item.stage}
              </Badge>
              <button
                className="icon-button subtle"
                aria-label="Remove"
                onClick={() => removeQueueItem(item.id)}
              >
                <Icon name="more" />
              </button>
            </div>
          ))}

          {/* Persisted evidence items */}
          {evidenceList.map((file) => (
            <div className="file-row" key={file.id}>
              <div className={`file-icon type-${file.modality}`}>
                <Icon name={file.modality === "document" ? "doc" : (file.modality as IconName)} />
              </div>
              <div className="file-info">
                <strong>{file.sourceFile}</strong>
                <span>{file.meta}</span>
              </div>
              <Badge tone={file.tone}>
                <Icon name="check" />
                {file.processingStage === "ready_for_ai" ? "READY FOR AI" : file.status}
              </Badge>
              <button className="icon-button subtle" aria-label="Actions">
                <Icon name="more" />
              </button>
            </div>
          ))}
        </div>

        <div className="queue-footer">
          <div>
            <span>{evidenceList.length} evidence items stored</span>
            <strong>READY FOR AI stage achieved. Tomorrow's NVIDIA AI pipeline will consume these records.</strong>
          </div>
          <Button variant="primary" icon="arrow" onClick={() => setScreen("evidence")}>
            View Evidence Repository
          </Button>
        </div>
      </Card>
    </div>
  );
}
