import { useState } from "react";
import Card, { CardHeader } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import type { IconName } from "../types";

export default function GraphPage() {
  const [selected, setSelected] = useState("CCTV_intersection.mp4");

  return (
    <div className="content graph-content">
      <div className="toolbar">
        <div className="segmented">
          {["All nodes", "Evidence", "People", "Vehicles", "Events"].map((item, i) => (
            <button className={i === 0 ? "active" : ""} key={item}>
              {item}
            </button>
          ))}
        </div>
        <div className="graph-legend">
          <span>
            <i className="supports" />SUPPORTS
          </span>
          <span>
            <i className="contradicts" />CONTRADICTS
          </span>
          <span>
            <i className="related" />RELATED TO
          </span>
        </div>
      </div>

      <div className="graph-layout">
        <Card className="graph-canvas">
          <div className="graph-tools">
            <button aria-label="Zoom in">
              <Icon name="plus" />
            </button>
            <button aria-label="Zoom out">−</button>
            <button aria-label="Expand">
              <Icon name="expand" />
            </button>
          </div>
          <svg className="graph-lines" viewBox="0 0 900 590">
            <path className="supports" d="M450 295 230 145M450 295 680 150M450 295 210 430M450 295 680 440M230 145 680 150" />
            <path className="contradicts" d="M210 430 680 150" />
            <path className="related" d="M230 145 120 285M680 150 800 290M210 430 420 500M680 440 420 500" />
          </svg>
          {[
            ["collision", "alert", "COLLISION EVENT", "18:42:17"],
            ["cctv", "video", "CCTV_intersection.mp4", "Primary video"],
            ["damage", "image", "vehicle_damage_01.jpg", "Damage photo"],
            ["witness", "audio", "witness_statement.wav", "Witness audio"],
            ["report", "doc", "police_report.pdf", "Police report"],
            ["vehicleA", "case", "VEHICLE A", "Dark sedan"],
            ["vehicleB", "case", "VEHICLE B", "White SUV"],
          ].map(([cls, icon, title, detail]) => (
            <button
              onClick={() => setSelected(title)}
              className={`graph-node ${cls} ${selected === title ? "selected" : ""}`}
              key={cls}
            >
              <div>
                <Icon name={icon as IconName} />
              </div>
              <strong>{title}</strong>
              <span>{detail}</span>
            </button>
          ))}
          <div className="canvas-caption">
            <span>12 NODES</span>
            <i /> <span>18 RELATIONSHIPS</span>
            <i /> <span>LAST UPDATED 2 MIN AGO</span>
          </div>
        </Card>

        <Card className="graph-detail">
          <CardHeader
            title={selected}
            eyebrow="SELECTED NODE"
            action={
              <button className="icon-button subtle">
                <Icon name="more" />
              </button>
            }
          />
          <div className="selected-preview">
            <Icon
              name={selected.includes("mp4") || selected.includes("CCTV") ? "video" : selected.includes("COLLISION") ? "alert" : "file"}
              size={28}
            />
            <Badge tone="green">VERIFIED</Badge>
          </div>
          <div className="metadata-group">
            <div className="metadata-title">NODE DETAILS</div>
            <div className="metadata-row">
              <span>Type</span>
              <strong>{selected.includes("mp4") ? "Video evidence" : "Evidence entity"}</strong>
            </div>
            <div className="metadata-row">
              <span>Added</span>
              <strong>Jan 14, 2025</strong>
            </div>
            <div className="metadata-row">
              <span>Confidence</span>
              <strong>96.4%</strong>
            </div>
            <div className="metadata-row">
              <span>Connections</span>
              <strong>6</strong>
            </div>
          </div>
          <div className="metadata-group">
            <div className="metadata-title">CONNECTED TO</div>
            {[
              ["SUPPORTS", "Collision event sequence", "green"],
              ["CONTRADICTS", "Witness signal statement", "amber"],
              ["RELATED TO", "Vehicle A damage photos", "blue"],
            ].map(([type, title, tone]) => (
              <div className="connection-row" key={title}>
                <Badge tone={tone as "green" | "amber" | "blue"}>{type}</Badge>
                <strong>{title}</strong>
                <Icon name="chevron" />
              </div>
            ))}
          </div>
          <Button icon="file">Open evidence details</Button>
        </Card>
      </div>
    </div>
  );
}
