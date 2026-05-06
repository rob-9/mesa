import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { Pill } from "@/components/primitives/Pill";
import { formatRelative } from "@/lib/format";
import type { AgentStatus } from "@/lib/types";
import { Card } from "./Card";

const stateMeta: Record<AgentStatus["state"], { label: string; tone: Parameters<typeof Pill>[0]["tone"] }> = {
  negotiating: { label: "negotiating", tone: "accent" },
  blocked: { label: "blocked", tone: "amber" },
  idle: { label: "idle", tone: "neutral" }
};

export function AgentStatusStrip({ agents }: { agents: AgentStatus[] }) {
  return (
    <Card
      title="Deployed agents"
      eyebrow={`${agents.length} ACTIVE`}
      trailing={
        <Link
          href="/agents"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            color: "var(--fg-3)"
          }}
        >
          View all <Icon name="chevron-right" size={12} />
        </Link>
      }
      noPadBody
    >
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${agents.length}, minmax(0, 1fr))` }}>
        {agents.map((agent, i) => {
          const meta = stateMeta[agent.state];
          const isLast = i === agents.length - 1;
          return (
            <div
              key={agent.id}
              style={{
                padding: "12px 16px",
                borderRight: isLast ? "none" : "1px solid var(--surface-2)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                minWidth: 0
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <Link
                  href={`/agents/${agent.id}`}
                  className="mono"
                  style={{
                    fontSize: 12,
                    color: "var(--fg-1)",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textDecoration: "none"
                  }}
                >
                  {agent.name}
                </Link>
                <Pill tone={meta.tone}>{meta.label}</Pill>
              </div>
              <span style={{ fontSize: 11, color: "var(--fg-4)" }}>{agent.role}</span>
              <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--surface-2)" }}>
                {agent.deliberationTitle ? (
                  <Link
                    href={`/deliberations/${agent.deliberationId}`}
                    style={{
                      fontSize: 11,
                      color: "var(--fg-2)",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {agent.deliberationTitle}
                  </Link>
                ) : (
                  <span style={{ fontSize: 11, color: "var(--fg-5)" }}>—</span>
                )}
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-5)", marginTop: 2, display: "block" }}>
                  {formatRelative(agent.lastActivity)} ago
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
