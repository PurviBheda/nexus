export default function ConfidenceIndicator({
  score,
  label = "OVERALL CONFIDENCE",
}: {
  score: number;
  label?: string;
}) {
  const getRating = (val: number) => {
    if (val >= 90) return { text: "High Confidence", tone: "green" };
    if (val >= 75) return { text: "Moderate Confidence", tone: "amber" };
    return { text: "Requires Review", tone: "red" };
  };

  const rating = getRating(score);

  return (
    <div className="confidence-block">
      <span>{label}</span>
      <strong>{score}%</strong>
      <div>
        <i style={{ width: `${score}%`, background: rating.tone === "green" ? "var(--green)" : rating.tone === "amber" ? "var(--amber)" : "var(--red)" }} />
      </div>
      <small>{rating.text}</small>
    </div>
  );
}
