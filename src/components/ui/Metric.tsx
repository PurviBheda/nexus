export default function Metric({
  value,
  label,
  detail,
  tone,
}: {
  value: string;
  label: string;
  detail: string;
  tone?: string;
}) {
  return (
    <div className="metric">
      <div className={tone}>{value}</div>
      <span>{label}</span>
      <small>{detail}</small>
    </div>
  );
}
