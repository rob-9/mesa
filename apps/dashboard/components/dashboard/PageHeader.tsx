import type { DashboardData } from "@/lib/types";

export function PageHeader({ counts }: { counts: DashboardData["counts"] }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 18
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            letterSpacing: "-0.015em",
            lineHeight: 1.15,
            fontWeight: 600,
            color: "var(--fg-0)"
          }}
        >
          Deliberations
        </h1>
        <div
          className="mono"
          style={{ marginTop: 4, fontSize: 12, color: "var(--fg-4)" }}
        >
          <span style={{ color: "var(--fg-1)" }}>{counts.active}</span> active
          <Sep />
          <span style={{ color: "var(--accent)" }}>{counts.awaitingAction}</span> awaiting action
          <Sep />
          <span style={{ color: counts.flagged > 0 ? "var(--amber)" : "var(--fg-1)" }}>
            {counts.flagged}
          </span>{" "}
          flagged
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={{
            padding: "8px 14px",
            borderRadius: "var(--r-pill)",
            background: "var(--surface-1)",
            color: "var(--fg-3)",
            fontSize: 12,
            border: "1px solid var(--surface-2)"
          }}
        >
          Sort
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
          + New deliberation
        </button>
      </div>
    </div>
  );
}

function Sep() {
  return <span style={{ color: "var(--fg-6)", margin: "0 10px" }}>·</span>;
}
