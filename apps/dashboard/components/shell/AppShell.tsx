import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: "100vh" }}>
        <TopBar />
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "20px 28px",
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
            minWidth: 0,
            minHeight: 0
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
