import Icon from "../ui/Icon";
import type { Screen, IconName } from "../../types";

const navItems: { label: string; icon: IconName; screen: Screen; badge?: number }[] = [
  { label: "Overview", icon: "grid", screen: "overview" },
  { label: "Investigations", icon: "case", screen: "dashboard" },
  { label: "Evidence", icon: "file", screen: "evidence" },
  { label: "Timeline", icon: "clock", screen: "timeline" },
  { label: "Evidence Graph", icon: "graph", screen: "graph" },
  { label: "AI Findings", icon: "spark", screen: "findings", badge: 3 },
  { label: "Ask NEXUS", icon: "chat", screen: "ask" },
  { label: "Reports", icon: "report", screen: "report" },
];

export default function Sidebar({
  screen,
  setScreen,
}: {
  screen: Screen;
  setScreen: (screen: Screen) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="brand" onClick={() => setScreen("overview")}>
        <div className="brand-mark">
          <span />
        </div>
        <div>
          <b>NEXUS</b>
          <small>INTELLIGENCE SYSTEM</small>
        </div>
      </div>

      <div className="case-switcher" onClick={() => setScreen("dashboard")}>
        <div>
          <span className="status-dot" /> ACTIVE CASE
        </div>
        <strong>CASE-001</strong>
        <small>Vehicle Collision</small>
        <Icon name="chevron" />
      </div>

      <nav className="nav">
        <div className="nav-label">WORKSPACE</div>
        {navItems.map((item) => (
          <button
            key={item.screen}
            className={`nav-item ${screen === item.screen ? "active" : ""}`}
            onClick={() => setScreen(item.screen)}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.badge && <em>{item.badge}</em>}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className={`nav-item ${screen === "settings" ? "active" : ""}`}
          onClick={() => setScreen("settings")}
        >
          <Icon name="settings" />
          <span>Settings</span>
        </button>
        <button
          className={`profile-card ${screen === "profile" ? "active" : ""}`}
          onClick={() => setScreen("profile")}
        >
          <div className="avatar">AK</div>
          <div>
            <strong>Alex Kim</strong>
            <small>Lead Investigator</small>
          </div>
          <Icon name="more" />
        </button>
      </div>
    </aside>
  );
}
