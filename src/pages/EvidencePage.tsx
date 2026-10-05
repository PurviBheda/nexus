import { useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Icon from "../components/ui/Icon";
import { CORE_EVIDENCE_ITEMS } from "../data/case001";
import type { IconName } from "../types";

export default function EvidencePage() {
  const [selected, setSelected] = useState(0);
  const selectedItem = CORE_EVIDENCE_ITEMS[selected] || CORE_EVIDENCE_ITEMS[0];

  return (
    <div className="content evidence-content">
      <div className="evidence-layout">
        {/* Evidence List Panel */}
        <Card className="evidence-list-panel">
          <div className="panel-heading">
            <div>
              <span>EVIDENCE REPOSITORY</span>
              <strong>{CORE_EVIDENCE_ITEMS.length} items</strong>
            </div>
            <button className="icon-button subtle" aria-label="Filter">
              <Icon name="filter" />
            </button>
          </div>
          <label className="list-search">
            <Icon name="search" />
            <input placeholder="Filter evidence files…" />
          </label>
          <div className="evidence-list">
            {CORE_EVIDENCE_ITEMS.map((item, index) => (
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
                  <small>
                    <i className="status-dot" /> {item.status}
                  </small>
                </div>
                <Icon name="chevron" />
              </button>
            ))}
          </div>
        </Card>

        {/* Media / Document Viewer Panel */}
        <Card className="viewer-panel">
          <div className="viewer-header">
            <div>
              <Badge tone={selectedItem.tone}>{selectedItem.modality.toUpperCase()}</Badge>
              <strong>{selectedItem.sourceFile}</strong>
            </div>
            <div>
              <button className="icon-button subtle" title="Download">
                <Icon name="download" />
              </button>
              <button className="icon-button subtle" title="Fullscreen">
                <Icon name="expand" />
              </button>
              <button className="icon-button subtle" title="More">
                <Icon name="more" />
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
                <i>OBJECT 02 · {selectedItem.confidence}%</i>
              </div>
            </div>
            <div className="camera-overlay bottom">
              <span>NXS-VISION · MULTIMODAL TRACKING</span>
              <span>FRAME 4112</span>
            </div>
            <button className="play-button" aria-label="Play">
              <Icon name="play" size={22} />
            </button>
          </div>

          <div className="player-controls">
            <button aria-label="Play/Pause">
              <Icon name="play" />
            </button>
            <span>02:43.084</span>
            <div className="scrubber">
              <i />
              <b />
            </div>
            <span>03:18.221</span>
            <button>1×</button>
          </div>

          <div className="analysis-tabs">
            <button className="active">Transcript & Analysis</button>
            <button>
              Detected objects <Badge>4</Badge>
            </button>
            <button>AI correlations</button>
          </div>

          <div className="transcript">
            <time>02:39</time>
            <p>Vehicle B enters the intersection, beginning a left turn across traffic.</p>
            <time className="active">02:43</time>
            <p className="active">{selectedItem.content}</p>
            <time>02:48</time>
            <p>Both vehicles come to a complete stop post-collision.</p>
          </div>
        </Card>

        {/* Metadata Inspector Panel */}
        <Card className="metadata-panel">
          <div className="panel-heading">
            <div>
              <span>INSPECTOR</span>
              <strong>Evidence details</strong>
            </div>
          </div>
          <div className="confidence-block">
            <span>ANALYSIS CONFIDENCE</span>
            <strong>{selectedItem.confidence}%</strong>
            <div>
              <i style={{ width: `${selectedItem.confidence}%` }} />
            </div>
            <small>High confidence match</small>
          </div>

          <div className="metadata-group">
            <div className="metadata-title">FILE METADATA</div>
            <div className="metadata-row">
              <span>Source file</span>
              <strong>{selectedItem.sourceFile}</strong>
            </div>
            <div className="metadata-row">
              <span>Modality</span>
              <strong>{selectedItem.modality}</strong>
            </div>
            <div className="metadata-row">
              <span>Hash ID</span>
              <strong>{selectedItem.hash}</strong>
            </div>
            <div className="metadata-row">
              <span>Uploaded</span>
              <strong>{selectedItem.uploadedAt}</strong>
            </div>
            <div className="metadata-row">
              <span>Added by</span>
              <strong>{selectedItem.addedBy}</strong>
            </div>
          </div>

          <div className="metadata-group">
            <div className="metadata-title">
              RELATIONSHIPS <Badge>{selectedItem.relationships?.length || 0}</Badge>
            </div>
            {selectedItem.relationships?.map((rel, i) => (
              <div className="relationship" key={i}>
                <Badge tone={rel.type === "SUPPORTS" ? "green" : rel.type === "CONTRADICTS" ? "amber" : "blue"}>
                  {rel.type}
                </Badge>
                <strong>{rel.target}</strong>
                <span>{rel.confidence}% confidence</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
