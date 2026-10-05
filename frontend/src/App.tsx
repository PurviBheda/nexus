import { useMemo, useState } from "react";
import Shell from "./components/layout/Shell";
import OverviewPage from "./pages/OverviewPage";
import DashboardPage from "./pages/DashboardPage";
import EvidencePage from "./pages/EvidencePage";
import TimelinePage from "./pages/TimelinePage";
import GraphPage from "./pages/GraphPage";
import FindingsPage from "./pages/FindingsPage";
import AskPage from "./pages/AskPage";
import ReportPage from "./pages/ReportPage";
import SettingsPage from "./pages/SettingsPage";
import CreatePage from "./pages/CreatePage";
import UploadPage from "./pages/UploadPage";
import ProfilePage from "./pages/ProfilePage";
import type { Screen } from "./types";

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");

  const view = useMemo(() => {
    switch (screen) {
      case "overview":
        return <OverviewPage setScreen={setScreen} />;
      case "create":
        return <CreatePage setScreen={setScreen} />;
      case "dashboard":
        return <DashboardPage setScreen={setScreen} />;
      case "upload":
        return <UploadPage setScreen={setScreen} />;
      case "timeline":
        return <TimelinePage />;
      case "evidence":
        return <EvidencePage />;
      case "graph":
        return <GraphPage />;
      case "findings":
        return <FindingsPage />;
      case "ask":
        return <AskPage />;
      case "report":
        return <ReportPage />;
      case "settings":
        return <SettingsPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <DashboardPage setScreen={setScreen} />;
    }
  }, [screen]);

  return (
    <Shell screen={screen} setScreen={setScreen}>
      {view}
    </Shell>
  );
}
