import Card, { CardHeader } from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import type { Screen, IconName } from "../types";

export default function OverviewPage({
  setScreen,
}: {
  setScreen: (screen: Screen) => void;
}) {
  return (
    <div className="content">
      <div className="hero-strip">
        <div>
          <Badge tone="green">SYSTEM OPERATIONAL</Badge>
          <div className="hero-title">
            Multimodal intelligence.
            <br />
            <span>One connected investigation.</span>
          </div>
          <p>
            Analyze video, audio, documents, and imagery with source-grounded AI built for defensible conclusions.
          </p>
        </div>
        <div className="hero-actions">
          <Button icon="plus" onClick={() => setScreen("create")} variant="primary">
            New investigation
          </Button>
          <Button icon="upload" onClick={() => setScreen("upload")}>
            Upload evidence
          </Button>
        </div>
        <div className="hero-grid" />
      </div>

      <div className="stats-grid">
        <StatCard label="ACTIVE INVESTIGATIONS" value="12" detail="+2 this month" icon="case" />
        <StatCard label="EVIDENCE ITEMS" value="1,284" detail="98.7% processed" icon="file" />
        <StatCard label="AI FINDINGS" value="47" detail="11 require review" icon="spark" />
        <StatCard label="PROCESSING QUEUE" value="04" detail="Est. 3 minutes" icon="clock" />
      </div>

      <div className="two-column wide-left">
        <Card>
          <CardHeader
            title="Recent investigations"
            eyebrow="CASE WORKSPACE"
            action={
              <button className="text-button" onClick={() => setScreen("dashboard")}>
                View all <Icon name="arrow" />
              </button>
            }
          />
          <div className="table">
            <div className="table-row table-head">
              <span>INVESTIGATION</span>
              <span>TYPE</span>
              <span>EVIDENCE</span>
              <span>PROGRESS</span>
              <span>UPDATED</span>
            </div>
            <button className="table-row featured" onClick={() => setScreen("dashboard")}>
              <span>
                <i>CASE-001</i>
                <strong>Vehicle Collision Investigation</strong>
              </span>
              <span>Traffic incident</span>
              <span>18 items</span>
              <span>
                <b className="progress">
                  <i style={{ width: "92%" }} />
                </b>
                92%
              </span>
              <span>12 min ago</span>
            </button>
            <button className="table-row">
              <span>
                <i>CASE-024</i>
                <strong>Warehouse Access Review</strong>
              </span>
              <span>Security</span>
              <span>42 items</span>
              <span>
                <b className="progress">
                  <i style={{ width: "68%" }} />
                </b>
                68%
              </span>
              <span>Yesterday</span>
            </button>
            <button className="table-row">
              <span>
                <i>CASE-019</i>
                <strong>Insurance Claim Analysis</strong>
              </span>
              <span>Claims</span>
              <span>27 items</span>
              <span>
                <b className="progress">
                  <i style={{ width: "100%" }} />
                </b>
                100%
              </span>
              <span>3 days ago</span>
            </button>
          </div>
        </Card>

        <Card>
          <CardHeader title="System activity" eyebrow="LIVE OPERATIONS" action={<Badge tone="green">LIVE</Badge>} />
          <div className="activity-list">
            {[
              ["check", "Analysis completed", "CCTV_intersection.mp4", "2 min"],
              ["spark", "Finding generated", "Timeline correlation · CASE-001", "8 min"],
              ["upload", "Evidence uploaded", "police_report.pdf", "14 min"],
              ["user", "Investigator joined", "M. Alvarez · CASE-024", "1 hr"],
            ].map(([icon, title, detail, time]) => (
              <div className="activity" key={detail}>
                <div className="activity-icon">
                  <Icon name={icon as IconName} />
                </div>
                <div>
                  <strong>{title}</strong>
                  <span>{detail}</span>
                </div>
                <small>{time}</small>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
