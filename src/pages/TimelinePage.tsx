import { useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import { TIMELINE_EVENTS } from "../data/case001";
import type { IconName } from "../types";

export default function TimelinePage() {
  const [filter, setFilter] = useState("All");
  const modalityMap: Record<string, string> = { Video: "video", Audio: "audio", Docs: "doc", Images: "image" };

  const visibleEvents =
    filter === "All"
      ? TIMELINE_EVENTS
      : TIMELINE_EVENTS.filter(
          (event) => modalityMap[filter] === event.icon || event.icon === "alert"
        );

  return (
    <div className="content">
      <div className="toolbar">
        <div className="segmented">
          {["All", "Video", "Audio", "Docs", "Images"].map((item) => (
            <button
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
          <Button icon="filter">
            Filters <Badge>2</Badge>
          </Button>
          <Button icon="download">Export</Button>
        </div>
      </div>

      <Card className="timeline-card">
        <div className="timeline-date">
          <span>JAN 14, 2025</span>
          <i />
          <Badge tone="green">6 MINUTE EVENT WINDOW</Badge>
        </div>
        <div className="full-timeline">
          {visibleEvents.map((event, index) => (
            <button
              className={`timeline-event ${event.isCritical ? "critical" : ""}`}
              key={event.id}
            >
              <time>
                {event.time}
                <small>{event.localTime}</small>
              </time>
              <div className={`timeline-marker ${event.tone}`}>
                <Icon name={event.icon as IconName} />
              </div>
              <div className="timeline-event-card">
                <div>
                  <Badge tone={event.tone}>
                    {event.isCritical ? "KEY EVENT" : event.icon.toUpperCase()}
                  </Badge>
                  <span>EVENT {String(index + 1).padStart(2, "0")}</span>
                </div>
                <strong>{event.title}</strong>
                <p>{event.detail}</p>
                <small>
                  <Icon name="link" /> {event.source}
                </small>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
