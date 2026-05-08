import Link from "next/link";
import { Pill } from "@/components/primitives/Pill";
import { formatRelative } from "@/lib/format";
import type { AgentDetail } from "@/lib/types";

const stateMeta: Record<AgentDetail["state"], { label: string; tone: Parameters<typeof Pill>[0]["tone"] }> = {
  negotiating: { label: "negotiating", tone: "accent" },
  blocked: { label: "blocked", tone: "amber" },
  idle: { label: "idle", tone: "neutral" }
};

interface RowProps {
  agent: AgentDetail;
  isLast: boolean;
  gridTemplate: string;
}

export function AgentRow({ agent, isLast, gridTemplate }: RowProps) {
  const meta = stateMeta[agent.state];
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="row-link"
      style={{
        display: "block",
        padding: "12px 20px",
        borderBottom: isLast ? "none" : "1px solid var(--border-row)",
        textDecoration: "none",
        color: "inherit"
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridTemplate,
          gap: 14,
          alignItems: "center",
          fontSize: 13
        }}
      >
        <span
          className="mono"
          title={agent.name}
          style={{
            color: "var(--fg-0)",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {agent.name}
        </span>
        <span title={agent.role} style={{ color: "var(--fg-3)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.role}</span>
        <span>
          <Pill tone={meta.tone}>{meta.label}</Pill>
        </span>
        <span
          title={agent.deliberationTitle ?? undefined}
          style={{
            color: agent.deliberationTitle ? "var(--fg-2)" : "var(--fg-5)",
            fontSize: 12,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {agent.deliberationTitle ?? "—"}
        </span>
        <span className="mono" style={{ textAlign: "right", color: "var(--fg-4)", fontSize: 12 }}>
          {formatRelative(agent.lastActivity)}
        </span>
      </div>
    </Link>
  );
}
