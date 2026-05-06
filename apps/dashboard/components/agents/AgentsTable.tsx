import type { AgentDetail } from "@/lib/types";
import { AgentRow } from "./AgentRow";

const GRID = "minmax(0, 1.4fr) 130px 110px minmax(0, 1.2fr) 80px";

export function AgentsTable({ agents }: { agents: AgentDetail[] }) {
  return (
    <div
      style={{
        background: "var(--surface-0)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0
      }}
    >
      <div
        className="mono"
        style={{
          flexShrink: 0,
          display: "grid",
          gridTemplateColumns: GRID,
          gap: 14,
          padding: "12px 20px",
          fontSize: 11,
          color: "var(--fg-5)",
          letterSpacing: "0.06em",
          borderBottom: "1px solid var(--surface-2)"
        }}
      >
        <span>AGENT</span>
        <span>ROLE</span>
        <span>STATE</span>
        <span>CURRENT DELIBERATION</span>
        <span style={{ textAlign: "right" }}>LAST</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "none", minHeight: 0 }}>
        {agents.map((a, i) => (
          <AgentRow
            key={a.id}
            agent={a}
            isLast={i === agents.length - 1}
            gridTemplate={GRID}
          />
        ))}
      </div>
    </div>
  );
}
