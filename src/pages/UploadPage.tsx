import Card, { CardHeader } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import { CORE_EVIDENCE_ITEMS } from "../data/case001";
import type { Screen, IconName } from "../types";

export default function UploadPage({
  setScreen,
}: {
  setScreen: (screen: Screen) => void;
}) {
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

      <Card className="upload-card">
        <div className="dropzone">
          <div className="upload-graphic">
            <Icon name="upload" size={25} />
          </div>
          <div className="card-title">Drop evidence files here</div>
          <p>Video (MP4, AVI, MOV), Audio (WAV, MP3), Documents (PDF, DOCX), Images (JPG, PNG)</p>
          <Button>Browse files</Button>
          <small>Maximum 10 GB per file · Encrypted during transfer</small>
        </div>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <CardHeader
          title="Upload queue"
          eyebrow={`${CORE_EVIDENCE_ITEMS.length} FILES · 1.3 GB`}
          action={<button className="text-button muted">Clear completed</button>}
        />
        <div className="file-list">
          {CORE_EVIDENCE_ITEMS.slice(0, 4).map((file, index) => (
            <div className="file-row" key={file.id}>
              <div className={`file-icon type-${file.modality}`}>
                <Icon name={file.modality === "document" ? "doc" : (file.modality as IconName)} />
              </div>
              <div className="file-info">
                <strong>{file.sourceFile}</strong>
                <span>{file.meta}</span>
                {index === 2 && (
                  <div className="processing-line">
                    <i style={{ width: "65%" }} />
                  </div>
                )}
              </div>
              <Badge tone={file.tone}>
                {file.status === "Analyzed" && <Icon name="check" />}
                {file.status}
              </Badge>
              <button className="icon-button subtle" aria-label="Actions">
                <Icon name="more" />
              </button>
            </div>
          ))}
        </div>
        <div className="queue-footer">
          <div>
            <span>3 of 4 files processed</span>
            <strong>AI analysis begins automatically after ingestion</strong>
          </div>
          <Button variant="primary" icon="arrow" onClick={() => setScreen("dashboard")}>
            Open investigation dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
