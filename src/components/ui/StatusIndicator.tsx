export default function StatusIndicator({
  active = true,
  label,
}: {
  active?: boolean;
  label?: string;
}) {
  return (
    <span className="status-indicator-wrap" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span className={`status-dot ${active ? "active" : "inactive"}`} />
      {label && <span style={{ font: "600 9px var(--mono)", letterSpacing: "0.8px" }}>{label}</span>}
    </span>
  );
}
