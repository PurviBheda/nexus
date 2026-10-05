import Card from "./Card";
import Icon from "./Icon";
import type { IconName } from "../../types";

export default function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: IconName;
}) {
  return (
    <Card className="stat">
      <div className="stat-top">
        <span>{label}</span>
        <div className="small-icon">
          <Icon name={icon} />
        </div>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </Card>
  );
}
