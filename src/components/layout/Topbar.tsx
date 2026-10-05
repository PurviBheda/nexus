import Icon from "../ui/Icon";
import type { Screen } from "../../types";

const screenTitles: Record<Screen, [string, string]> = {
  overview: ["Intelligence Overview", "Monitor investigations and system activity"],
  create: ["Create Investigation", "Establish a new secured case workspace"],
  dashboard: ["Vehicle Collision Investigation", "Command center · CASE-001"],
  upload: ["Evidence Ingestion", "Upload and process multimodal source material"],
  timeline: ["Evidence Timeline", "Synchronized chronology across all modalities"],
  evidence: ["Evidence Explorer", "Inspect, compare, and trace source relationships"],
  graph: ["Evidence Graph", "Explore entity and source relationships"],
  findings: ["AI Findings", "Correlations and contradictions requiring review"],
  ask: ["Ask NEXUS", "Evidence-grounded investigation assistant"],
  report: ["Investigation Report", "Executive brief · Draft v0.8"],
  settings: ["Workspace Settings", "Case configuration and access controls"],
  profile: ["Investigator Profile", "Account and activity overview"],
};

export default function Topbar({ screen }: { screen: Screen }) {
  const [title, subtitle] = screenTitles[screen] || ["NEXUS Workspace", "Enterprise Intelligence"];

  return (
    <header className="topbar">
      <div>
        <div className="page-title">{title}</div>
        <div className="page-subtitle">{subtitle}</div>
      </div>
      <div className="top-actions">
        <label className="search">
          <Icon name="search" />
          <input placeholder="Search evidence, entities, findings…" />
          <kbd>⌘ K</kbd>
        </label>
        <button className="icon-button" title="Notifications">
          <Icon name="bell" />
          <span className="notification-dot" />
        </button>
        <div className="classification">
          <span /> INTERNAL
        </div>
      </div>
    </header>
  );
}
