import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";

export default function ProfilePage() {
  return (
    <div className="content centered-content">
      <Card className="form-card placeholder">
        <div className="form-icon">
          <Icon name="user" size={24} />
        </div>
        <div className="card-title large">Alex Kim</div>
        <p>Lead Investigator · Enterprise Intelligence Unit</p>
        <div style={{ marginTop: 16 }}>
          <Button variant="primary">Manage profile</Button>
        </div>
      </Card>
    </div>
  );
}
