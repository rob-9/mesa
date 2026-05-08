import Link from "next/link";
import { Pill } from "@/components/primitives/Pill";
import { formatRelative } from "@/lib/format";
import type { AgentStatus } from "@/lib/types";
import { Card } from "./Card";

const stateMeta: Record<
  AgentStatus["state"],
  { label: string; tone: Parameters<typeof Pill>[0]["tone"]; rank: number; dot: string }
> = {
  blocked: { label: "blocked", tone: "amber", rank: 0, dot: "var(--amber)" },
  negotiating: { label: "negotiating", tone: "accent", rank: 1, dot: "var(--accent)" },
  idle: { label: "idle", tone: "neutral", rank: 2, dot: "var(--fg-6)" }
};

export function AgentFleetCard({ agents }: { agents: AgentStatus[] }) {
  const sorted = [...agents].sort((a, b) => {
    const r = stateMeta[a.state].rank - stateMeta[b.state].rank;
    if (r !== 0) return r;
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
  });
  return (
    <Card noPadBody>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "none" }}>
        {sorted.map((agent, i) => {
          const meta = stateMeta[agent.state];
          const isLast = i === sorted.length - 1;
          return (
            <div
              key={agent.id}
              style={{
                display: "grid",
                gridTemplateColumns: "8px minmax(0, 1.1fr) minmax(0, 1.2fr) auto",
                gap: 14,
                alignItems: "center",
                padding: "13px 18px",
                borderBottom: isLast ? "none" : "1px solid var(--border-row)"
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "var(--r-pill)",
                  background: meta.dot
                }}
              />
              <div style={{ minWidth: 0 }}>
                <Link
                  href={`/agents/${agent.id}`}
                  className="mono"
                  style={{
                    fontSize: 12,
                    color: "var(--fg-1)",
                    fontWeight: 500,
                    textDecoration: "none",
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {agent.name}
                </Link>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--fg-5)",
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {agent.role}
                </span>
              </div>
              <div style={{ minWidth: 0 }}>
                {agent.deliberationTitle && agent.deliberationId ? (
                  <Link
                    href={`/deliberations/${agent.deliberationId}`}
                    title={agent.deliberationTitle}
                    style={{
                      fontSize: 12,
                      color: "var(--fg-1)",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {agent.deliberationTitle}
                  </Link>
                ) : (
                  <span style={{ fontSize: 12, color: "var(--fg-5)" }}>idle</span>
                )}
                <span
                  className="mono"
                  style={{ fontSize: 11, color: "var(--fg-5)", display: "block", marginTop: 2 }}
                >
                  {formatRelative(agent.lastActivity)} ago
                </span>
              </div>
              <Pill tone={meta.tone}>{meta.label}</Pill>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
