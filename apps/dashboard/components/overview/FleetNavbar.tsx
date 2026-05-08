import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import type { AgentStatus } from "@/lib/types";

const stateOrder: { state: AgentStatus["state"]; label: string; dot: string }[] = [
  { state: "negotiating", label: "active", dot: "var(--accent)" },
  { state: "blocked", label: "blocked", dot: "var(--amber)" },
  { state: "idle", label: "idle", dot: "var(--fg-6)" }
];

export function FleetNavbar({ agents }: { agents: AgentStatus[] }) {
  const counts = {
    negotiating: agents.filter((a) => a.state === "negotiating").length,
    blocked: agents.filter((a) => a.state === "blocked").length,
    idle: agents.filter((a) => a.state === "idle").length
  };
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        padding: "12px 18px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 0
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14
        }}
      >
        <span
          className="mono"
          style={{ fontSize: 10, color: "var(--fg-5)", letterSpacing: "0.06em" }}
        >
          AGENT FLEET
        </span>
        <Link
          href="/agents"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            color: "var(--fg-3)",
            textDecoration: "none"
          }}
        >
          View all <Icon name="chevron-right" size={11} />
        </Link>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flex: 1 }}>
        <span
          className="mono"
          style={{
            fontSize: 24,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--fg-1)"
          }}
        >
          {agents.length}
        </span>
        <span style={{ fontSize: 11, color: "var(--fg-4)" }}>deployed</span>
        <span
          aria-hidden
          style={{ width: 1, alignSelf: "stretch", background: "var(--surface-2)", margin: "0 4px" }}
        />
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          {stateOrder.map((s) => (
            <span
              key={s.state}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: "var(--fg-3)"
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "var(--r-pill)",
                  background: s.dot
                }}
              />
              <span className="mono" style={{ color: "var(--fg-1)", fontWeight: 500 }}>
                {counts[s.state]}
              </span>
              <span style={{ color: "var(--fg-4)" }}>{s.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
