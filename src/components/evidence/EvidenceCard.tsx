import Badge from "../ui/Badge";
import Icon from "../ui/Icon";
import type { EvidenceItem } from "../../types";

export default function EvidenceCard({
  item,
  onSelect,
  isSelected = false,
}: {
  item: EvidenceItem;
  onSelect?: (item: EvidenceItem) => void;
  isSelected?: boolean;
}) {
  return (
    <div
      className={`file-row ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect?.(item)}
      style={{ cursor: onSelect ? "pointer" : "default" }}
    >
      <div className={`file-icon type-${item.modality}`}>
        <Icon name={item.modality === "document" ? "doc" : item.modality} />
      </div>
      <div className="file-info">
        <strong>{item.sourceFile}</strong>
        <span>{item.meta}</span>
        {item.speaker && <small style={{ color: "var(--subtle)", display: "block" }}>Speaker: {item.speaker}</small>}
      </div>
      <Badge tone={item.tone}>
        {item.status === "Analyzed" && <Icon name="check" />}
        {item.status}
      </Badge>
      <button className="icon-button subtle" aria-label="Actions">
        <Icon name="more" />
      </button>
    </div>
  );
}
