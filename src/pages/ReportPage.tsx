import type { ReactNode } from "react";
import Card, { CardHeader } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";

export default function ReportPage() {
  return (
    <div className="content report-content">
      <div className="report-toolbar">
        <div>
          <Button icon="chevron">Back</Button>
          <span>Draft saved 2 minutes ago</span>
        </div>
        <div>
          <Button>Share review</Button>
          <Button icon="download" variant="primary">
            Export PDF
          </Button>
        </div>
      </div>

      <div className="report-workspace">
        <aside className="report-outline">
          <span>REPORT OUTLINE</span>
          {[
            "Executive Summary",
            "Incident Overview",
            "Evidence Sources",
            "Timeline Analysis",
            "Key Findings",
            "Contradictions",
            "Confidence Assessment",
            "Appendix",
          ].map((item, index) => (
            <button className={index === 0 ? "active" : ""} key={item}>
              <i>{String(index + 1).padStart(2, "0")}</i>
              {item}
            </button>
          ))}
        </aside>

        <article className="report-paper">
          <div className="report-classification">INTERNAL · INVESTIGATIVE USE ONLY</div>
          <header>
            <div className="report-logo">
              <div className="brand-mark">
                <span />
              </div>
              NEXUS
            </div>
            <div>
              <span>INVESTIGATION REPORT</span>
              <strong>CASE-001</strong>
            </div>
          </header>

          <div className="report-title">
            <span>VEHICLE COLLISION INVESTIGATION</span>
            <h1>Executive Investigation Report</h1>
            <p>Collision at 5th Avenue & Market Street</p>
          </div>

          <div className="report-meta">
            <div>
              <span>INCIDENT DATE</span>
              <strong>January 14, 2025</strong>
            </div>
            <div>
              <span>LEAD INVESTIGATOR</span>
              <strong>Alex Kim</strong>
            </div>
            <div>
              <span>REPORT VERSION</span>
              <strong>Draft v0.8</strong>
            </div>
            <div>
              <span>GENERATED</span>
              <strong>January 18, 2025</strong>
            </div>
          </div>

          <ReportSection number="01" title="Executive Summary">
            <p>
              This report presents findings from a multimodal analysis of 18 evidence items related to a two-vehicle collision at the intersection of 5th Avenue and Market Street. The evidence includes CCTV footage, witness audio, police documentation, repair estimates, and scene photography.
            </p>
            <div className="report-callout">
              <strong>PRIMARY ASSESSMENT</strong>
              <p>
                Available evidence indicates Vehicle B initiated a left turn across Vehicle A’s established path, resulting in a front-left impact. This assessment is supported by four independent evidence sources with an aggregate confidence of <b>94%</b>.
              </p>
            </div>
          </ReportSection>

          <ReportSection number="02" title="Evidence Sources">
            <div className="report-table">
              <div>
                <b>MODALITY</b>
                <b>SOURCES</b>
                <b>STATUS</b>
              </div>
              <div>
                <span>Video</span>
                <span>3 files · 09:42 total</span>
                <Badge tone="green">VERIFIED</Badge>
              </div>
              <div>
                <span>Audio</span>
                <span>4 files · 22:18 total</span>
                <Badge tone="green">VERIFIED</Badge>
              </div>
              <div>
                <span>Documents</span>
                <span>3 files · 28 pages</span>
                <Badge tone="green">VERIFIED</Badge>
              </div>
              <div>
                <span>Images</span>
                <span>8 files</span>
                <Badge tone="green">VERIFIED</Badge>
              </div>
            </div>
          </ReportSection>

          <ReportSection number="03" title="Material Contradiction">
            <p>
              One witness statement places the traffic signal change before Vehicle A entered the intersection. Frame-level CCTV analysis places the change 4.2 seconds later. The video source is time-synchronized and carries higher evidentiary confidence.
            </p>
          </ReportSection>

          <div className="report-confidence">
            <div className="donut small">
              <strong>94%</strong>
              <span>CONFIDENCE</span>
            </div>
            <div>
              <strong>High-confidence assessment</strong>
              <p>Calculated from source quality, cross-modal agreement, timestamp integrity, and investigator-verified findings.</p>
            </div>
          </div>

          <footer>
            <span>NEXUS · MULTIMODAL INTELLIGENCE SYSTEM</span>
            <span>PAGE 1 OF 12</span>
          </footer>
        </article>

        <aside className="report-review">
          <span>REPORT STATUS</span>
          <div className="report-status">
            <Badge tone="amber">DRAFT</Badge>
            <strong>8 of 10 sections</strong>
            <small>2 sections need review</small>
            <b>
              <i style={{ width: "80%" }} />
            </b>
          </div>
          <div className="review-checklist">
            <strong>READINESS CHECK</strong>
            <span>
              <Icon name="check" /> Sources verified
            </span>
            <span>
              <Icon name="check" /> Findings reviewed
            </span>
            <span>
              <Icon name="check" /> Citations complete
            </span>
            <span className="pending">
              <Icon name="clock" /> Supervisor approval
            </span>
          </div>
          <Button variant="primary" icon="check">
            Submit for review
          </Button>
        </aside>
      </div>
    </div>
  );
}

function ReportSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="report-section">
      <div className="report-section-title">
        <span>{number}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}
