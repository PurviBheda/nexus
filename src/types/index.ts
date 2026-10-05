export type Screen =
  | "overview"
  | "create"
  | "dashboard"
  | "upload"
  | "timeline"
  | "evidence"
  | "graph"
  | "findings"
  | "ask"
  | "report"
  | "settings"
  | "profile";

export type Modality = "video" | "audio" | "document" | "image";

export type EvidenceStatus = "Analyzed" | "Processing" | "Queued" | "Verified" | "Requires Review";

export type EvidenceTone = "green" | "amber" | "blue" | "red" | "neutral";

export type FindingType =
  | "CONTRADICTION"
  | "CORRELATION"
  | "TIMELINE"
  | "MISSING_EVIDENCE"
  | "SUPPORTED";

export interface EvidenceRelationship {
  type: "SUPPORTS" | "CONTRADICTS" | "RELATED_TO";
  target: string;
  confidence: number;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  sourceFile: string;
  modality: Modality;
  content: string;
  timestampStart?: string;
  timestampEnd?: string;
  page?: number;
  speaker?: string;
  confidence: number;
  status: EvidenceStatus;
  tone: EvidenceTone;
  meta: string;
  fileSize?: string;
  duration?: string;
  resolution?: string;
  hash?: string;
  addedBy?: string;
  uploadedAt?: string;
  relationships?: EvidenceRelationship[];
}

export interface InvestigationCase {
  id: string;
  title: string;
  type: string;
  description: string;
  status: string;
  leadInvestigator: string;
  incidentDate: string;
  evidenceCount: number;
  eventWindow: string;
  entitiesCount: number;
  overallConfidence: number;
  openFindingsCount: number;
  progress: number;
}

export interface AIFinding {
  id: string;
  type: FindingType;
  tone: EvidenceTone;
  confidence: number;
  title: string;
  body: string;
  sources: string[];
  status: "OPEN" | "VERIFIED" | "DISMISSED";
}

export interface TimelineEvent {
  id: string;
  time: string;
  localTime: string;
  icon: string;
  tone: EvidenceTone;
  title: string;
  detail: string;
  source: string;
  isCritical?: boolean;
}

export type IconName =
  | "grid"
  | "case"
  | "file"
  | "clock"
  | "graph"
  | "spark"
  | "chat"
  | "report"
  | "settings"
  | "user"
  | "search"
  | "bell"
  | "plus"
  | "upload"
  | "video"
  | "audio"
  | "image"
  | "doc"
  | "arrow"
  | "check"
  | "filter"
  | "play"
  | "more"
  | "download"
  | "send"
  | "expand"
  | "link"
  | "alert"
  | "chevron";
