import type { Deliberation } from "@/lib/types";
import { DeliberationRow } from "./DeliberationRow";

const GRID = "minmax(0, 1fr) 100px 130px 100px 44px";

export function DeliberationsTable({ deliberations }: { deliberations: Deliberation[] }) {
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
      <div style={{ overflowX: "auto", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{ minWidth: 680, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
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
            <span>TITLE</span>
            <span>PARTY</span>
            <span>PROGRESS</span>
            <span>WAITING</span>
            <span style={{ textAlign: "right" }}>LAST</span>
          </div>
          <div>
            {deliberations.map((d, i) => (
              <DeliberationRow
                key={d.id}
                deliberation={d}
                isLast={i === deliberations.length - 1}
                gridTemplate={GRID}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
