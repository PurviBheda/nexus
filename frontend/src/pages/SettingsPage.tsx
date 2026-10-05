import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";

export default function SettingsPage() {
  return (
    <div className="content centered-content">
      <Card className="form-card placeholder">
        <div className="form-icon">
          <Icon name="settings" size={24} />
        </div>
        <div className="card-title large">Workspace configuration</div>
        <p>Manage case permissions, AI analysis defaults, retention policies, and export controls.</p>
        <div style={{ marginTop: 16 }}>
          <Button variant="primary">Save settings</Button>
        </div>
      </Card>
    </div>
  );
}
