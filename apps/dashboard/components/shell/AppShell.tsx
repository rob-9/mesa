import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "216px minmax(0, 1fr)",
        height: "100%",
        overflow: "hidden"
      }}
    >
      <Sidebar />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, height: "100%" }}>
        <TopBar />
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "16px 28px 28px",
            width: "100%",
            minWidth: 0,
            minHeight: 0,
            overflowY: "auto"
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
