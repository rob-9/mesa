import type { ReactNode } from "react";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar />
      <main style={{ flex: 1, padding: "28px 32px", maxWidth: 1400, width: "100%", margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}
