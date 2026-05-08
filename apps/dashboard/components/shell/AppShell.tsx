import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

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
      <div style={{ height: "100vh" }}>
        <Sidebar />
      </div>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, height: "100vh" }}>
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "16px 28px 28px",
            width: "100%",
            minWidth: 0,
            minHeight: 0,
            overflow: "auto"
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
