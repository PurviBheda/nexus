import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { Screen } from "../../types";

export default function Shell({
  screen,
  setScreen,
  children,
}: {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <Sidebar screen={screen} setScreen={setScreen} />
      <main className="main">
        <Topbar screen={screen} />
        {children}
      </main>
    </div>
  );
}
