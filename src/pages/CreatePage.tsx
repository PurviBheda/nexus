import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import type { Screen } from "../types";

export default function CreatePage({
  setScreen,
}: {
  setScreen: (screen: Screen) => void;
}) {
  return (
    <div className="content centered-content">
      <Card className="form-card">
        <div className="form-intro">
          <div className="form-icon">
            <Icon name="case" size={22} />
          </div>
          <div>
            <div className="card-title large">Investigation details</div>
            <p>Create a secured workspace for evidence processing and collaborative analysis.</p>
          </div>
        </div>

        <div className="form-grid">
          <label className="field full">
            <span>INVESTIGATION NAME</span>
            <input defaultValue="Vehicle Collision Investigation" />
          </label>
          <label className="field">
            <span>CASE ID</span>
            <div className="input-prefix">
              <i>NXS–</i>
              <input defaultValue="CASE-001" />
            </div>
          </label>
          <label className="field">
            <span>INVESTIGATION TYPE</span>
            <select defaultValue="Traffic Incident">
              <option>Traffic Incident</option>
              <option>Security Review</option>
              <option>Insurance Claim</option>
              <option>Forensic Audit</option>
            </select>
          </label>
          <label className="field full">
            <span>DESCRIPTION</span>
            <textarea
              rows={4}
              defaultValue="Investigation into a two-vehicle collision at the intersection of 5th Avenue and Market Street on January 14, 2025."
            />
            <small>Provide enough context for accurate AI-assisted analysis.</small>
          </label>
          <label className="field">
            <span>LEAD INVESTIGATOR</span>
            <div className="input-person">
              <div className="avatar mini">AK</div>
              <input defaultValue="Alex Kim" />
            </div>
          </label>
          <label className="field">
            <span>INCIDENT DATE</span>
            <input type="date" defaultValue="2025-01-14" />
          </label>
        </div>

        <div className="form-footer">
          <div>
            <Icon name="check" />
            <span>Evidence encryption enabled</span>
          </div>
          <div>
            <Button variant="ghost" onClick={() => setScreen("overview")}>
              Cancel
            </Button>
            <Button variant="primary" icon="arrow" onClick={() => setScreen("upload")}>
              Create & continue
            </Button>
          </div>
        </div>
      </Card>

      <div className="security-note">
        <Icon name="check" />
        <span>All case data is encrypted at rest and isolated to authorized personnel.</span>
      </div>
    </div>
  );
}
