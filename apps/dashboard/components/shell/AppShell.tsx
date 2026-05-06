import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "216px minmax(0, 1fr)",
        height: "100vh",
        overflow: "hidden"
      }}
    >
      <Sidebar />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, height: "100vh" }}>
        <TopBar />
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "16px 28px",
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
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
