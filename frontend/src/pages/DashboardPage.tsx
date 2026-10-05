import CaseBanner from "../components/dashboard/CaseBanner";
import Card, { CardHeader } from "../components/ui/Card";
import Metric from "../components/ui/Metric";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import EvidenceCard from "../components/evidence/EvidenceCard";
import { CORE_EVIDENCE_ITEMS, AI_FINDINGS } from "../data/case001";
import type { Screen, IconName } from "../types";

export default function DashboardPage({
  setScreen,
}: {
  setScreen: (screen: Screen) => void;
}) {
  return (
    <div className="content">
      {/* Case Header Banner */}
      <CaseBanner setScreen={setScreen} />

      {/* Top Metrics Row */}
      <Card className="metrics-card">
        <Metric value="18" label="EVIDENCE ITEMS" detail="4 modalities" />
        <Metric value="06:14" label="EVENT WINDOW" detail="18:39–18:45" />
        <Metric value="12" label="IDENTIFIED ENTITIES" detail="5 people · 3 vehicles" />
        <Metric
          value="87%"
          label="OVERALL CONFIDENCE"
          detail="High confidence"
          tone="green-text"
        />
        <Metric
          value="03"
          label="OPEN FINDINGS"
          detail="Requires review"
          tone="amber-text"
        />
      </Card>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Synchronized Evidence Timeline Preview */}
        <Card className="timeline-preview">
          <CardHeader
            title="Incident timeline"
            eyebrow="SYNCHRONIZED EVIDENCE"
            action={
              <button className="text-button" onClick={() => setScreen("timeline")}>
                Open timeline <Icon name="arrow" />
              </button>
            }
          />
          <div className="mini-timeline">
            <div className="time-scale">
              <span>18:39</span>
              <span>18:41</span>
              <span>18:43</span>
              <span>18:45</span>
            </div>
            {[
              ["video", "CCTV CAM 04", 12, 72],
              ["audio", "WITNESS AUDIO", 29, 60],
              ["doc", "POLICE REPORT", 48, 42],
              ["image", "DAMAGE PHOTOS", 68, 22],
            ].map(([icon, label, left, width]) => (
              <div className="track" key={label as string}>
                <span>
                  <Icon name={icon as IconName} />
                  {label}
                </span>
                <div>
                  <i style={{ left: `${left}%`, width: `${width}%` }} />
                </div>
              </div>
            ))}
            <div className="event-marker">
              <b>COLLISION</b>
              <span>18:42:17</span>
            </div>
          </div>
        </Card>

        {/* Evidence Health / Processing Status */}
        <Card className="health-card">
          <CardHeader title="Evidence health" eyebrow="PROCESSING STATUS" />
          <div className="donut-wrap">
            <div className="donut">
              <strong>94%</strong>
              <span>READY</span>
            </div>
            <div className="health-legend">
              <span>
                <i className="green-dot" />17 processed <b>94%</b>
              </span>
              <span>
                <i className="blue-dot" />1 processing <b>6%</b>
              </span>
              <span>
                <i className="gray-dot" />0 failed <b>0%</b>
              </span>
            </div>
          </div>
          <div className="health-footer">
            <Icon name="check" /> Chain of custody verified
          </div>
        </Card>

        {/* AI Findings Preview */}
        <Card className="findings-preview">
          <CardHeader
            title="Key findings"
            eyebrow="AI ANALYSIS · 3 NEW"
            action={
              <button className="text-button" onClick={() => setScreen("findings")}>
                View all <Icon name="arrow" />
              </button>
            }
          />
          <div className="finding-rows">
            {AI_FINDINGS.slice(0, 2).map((finding) => (
              <div className="finding-row" key={finding.id}>
                <div className={`finding-type ${finding.tone}`}>
                  <Icon name={finding.type === "CONTRADICTION" ? "alert" : "link"} />
                </div>
                <div>
                  <Badge tone={finding.tone}>{finding.type}</Badge>
                  <strong style={{ display: "block", marginTop: 4 }}>{finding.title}</strong>
                  <p>{finding.body}</p>
                  <span>{finding.sources.length} sources · {finding.confidence}% confidence</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Connected Entities / Relationship Graph Preview */}
        <Card className="entities-card">
          <CardHeader
            title="Connected entities"
            eyebrow="RELATIONSHIPS"
            action={
              <button className="text-button" onClick={() => setScreen("graph")}>
                Explore graph <Icon name="arrow" />
              </button>
            }
          />
          <div className="entity-map">
            <svg viewBox="0 0 400 180">
              <path d="M200 90 90 42M200 90 310 42M200 90 82 142M200 90 320 140" />
              <path className="accent-line" d="M90 42 310 42" />
            </svg>
            <div className="entity-node center">
              <Icon name="case" />
              <b>COLLISION</b>
            </div>
            <div className="entity-node n1">Vehicle A</div>
            <div className="entity-node n2">Vehicle B</div>
            <div className="entity-node n3">Elena R.</div>
            <div className="entity-node n4">Cam 04</div>
          </div>
        </Card>
      </div>

      {/* Case-001 Realistic Evidence Files Section */}
      <Card style={{ marginTop: 16 }}>
        <CardHeader
          title="Recent evidence items"
          eyebrow="CASE-001 MULTIMODAL REPOSITORY"
          action={
            <button className="text-button" onClick={() => setScreen("evidence")}>
              View all evidence <Icon name="arrow" />
            </button>
          }
        />
        <div className="file-list">
          {CORE_EVIDENCE_ITEMS.map((item) => (
            <EvidenceCard
              key={item.id}
              item={item}
              onSelect={() => setScreen("evidence")}
            />
          ))}
        </div>
      </Card>

      {/* Ask NEXUS Query Prompt Box */}
      <Card className="ask-bar" style={{ marginTop: 16 }}>
        <div className="ask-symbol">
          <Icon name="spark" />
        </div>
        <div>
          <strong>Ask NEXUS about this investigation</strong>
          <span>Answers include verifiable citations to source evidence.</span>
        </div>
        <button onClick={() => setScreen("ask")}>
          Ask a question…<kbd>⌘ ↵</kbd>
          <Icon name="send" />
        </button>
      </Card>
    </div>
  );
}
