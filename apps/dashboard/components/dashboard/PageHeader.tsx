import type { DashboardData } from "@/lib/types";
import { StatLine } from "./StatLine";

export function PageHeader({ counts }: { counts: DashboardData["counts"] }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 22
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 30,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            fontWeight: 600,
            color: "var(--fg-0)"
          }}
        >
          Deliberations <span style={{ color: "var(--fg-3)", fontWeight: 400 }}>today</span>
        </h1>
        <StatLine counts={counts} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={{
            padding: "8px 14px",
            borderRadius: "var(--r-pill)",
            background: "var(--surface-1)",
            color: "var(--fg-3)",
            fontSize: 12
          }}
        >
          Filter
        </button>
        <button
          style={{
            padding: "8px 14px",
            borderRadius: "var(--r-pill)",
            background: "var(--accent)",
            color: "var(--bg)",
            fontSize: 12,
            fontWeight: 500
          }}
        >
          + New
        </button>
      </div>
    </div>
  );
}
