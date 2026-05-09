import Link from "next/link";
import { Pill } from "@/components/primitives/Pill";
import type { AgentDetail } from "@/lib/types";

const stateMeta: Record<AgentDetail["state"], { label: string; tone: Parameters<typeof Pill>[0]["tone"] }> = {
  negotiating: { label: "negotiating", tone: "accent" },
  blocked: { label: "blocked", tone: "amber" },
  idle: { label: "idle", tone: "neutral" }
};

function formatDeployDate(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

export function AgentHeader({ agent }: { agent: AgentDetail }) {
  const meta = stateMeta[agent.state];
  return (
    <div style={{ marginBottom: 4 }}>
      <div className="mono" style={{ fontSize: 13, color: "var(--fg-4)", marginBottom: 14 }}>
        <Link href="/agents" style={{ color: "var(--fg-2)" }}>
          agents
        </Link>
        <span style={{ color: "var(--fg-6)", margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--fg-0)" }}>{agent.name}</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span
            className="mono"
            title={agent.name}
            style={{
              fontSize: 18,
              color: "var(--fg-0)",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {agent.name}
          </span>
          <Pill tone="soft">{agent.role}</Pill>
          <Pill tone={meta.tone}>{meta.label}</Pill>
        </div>
        {agent.deliberationTitle && agent.deliberationId ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <span style={{ color: "var(--fg-5)" }}>Currently in:</span>
            <Link
              href={`/deliberations/${agent.deliberationId}`}
              className="mono"
              style={{ color: "var(--fg-1)", textDecoration: "none" }}
            >
              {agent.deliberationTitle}
            </Link>
          </div>
        ) : null}
      </div>
      <div
        style={{
          marginTop: 8,
          display: "flex",
          gap: 16,
          alignItems: "center",
          fontSize: 11,
          color: "var(--fg-5)"
        }}
      >
        <span>
          owner <span className="mono" style={{ color: "var(--fg-3)" }}>{agent.config.owner}</span>
        </span>
        <span style={{ color: "var(--fg-6)" }}>·</span>
        <span>
          deployed{" "}
          <span className="mono" style={{ color: "var(--fg-3)" }}>
            {formatDeployDate(agent.config.deployedAt)}
          </span>
        </span>
      </div>
      <div style={{ height: 1, background: "var(--surface-2)", marginTop: 16 }} />
      {/* config strip */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto auto 1fr",
            gap: 14,
            alignItems: "center"
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--fg-5)",
              letterSpacing: "0.06em"
            }}
          >
            MODEL
          </span>
          <span
            className="mono"
            style={{
              padding: "3px 10px",
              background: "var(--accent-soft)",
              color: "var(--accent)",
              borderRadius: "var(--r-pill)",
              fontSize: 11,
              whiteSpace: "nowrap"
            }}
          >
            {agent.config.model}
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
          <div
            aria-hidden
            style={{
              width: 2,
              background: "var(--accent)",
              borderRadius: 1,
              flexShrink: 0,
              opacity: 0.7
            }}
          />
          <div
            style={{
              fontSize: 12,
              color: "var(--fg-2)",
              fontStyle: "italic",
              lineHeight: 1.55
            }}
          >
            {agent.config.persona}
          </div>
        </div>
      </div>
    </div>
  );
}
