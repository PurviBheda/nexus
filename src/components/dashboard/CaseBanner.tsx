import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import type { Screen } from "../../types";

export default function CaseBanner({
  setScreen,
}: {
  setScreen: (screen: Screen) => void;
}) {
  return (
    <div className="case-banner">
      <div>
        <div className="case-title-line">
          <Badge tone="green">ACTIVE</Badge>
          <span>CASE-001</span>
          <i>Traffic incident</i>
        </div>
        <p style={{ margin: "6px 0 4px" }}>
          Two-vehicle collision at 5th Avenue & Market Street · Jan 14, 2025, 18:42
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "600 10px/1.2 var(--mono)", color: "var(--green)" }}>
          <Icon name="spark" size={12} />
          <span>“NEXUS doesn’t just search files. It connects evidence across them.”</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Button icon="upload" onClick={() => setScreen("upload")}>
          Add evidence
        </Button>
        <Button icon="report" onClick={() => setScreen("report")} variant="primary">
          Generate report
        </Button>
      </div>
    </div>
  );
}
