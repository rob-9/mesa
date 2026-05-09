import Link from "next/link";
import { DEMO_NOW_ISO, formatRelative } from "@/lib/format";
import type { AgentStatus } from "@/lib/types";

const STATE_TINTS: Record<
  AgentStatus["state"],
  { bg: string; border: string; ring: string; label: string }
> = {
  negotiating: {
    bg: "var(--accent-soft)",
    border: "1px solid var(--accent-ring)",
    ring: "var(--accent)",
    label: "negotiating"
  },
  idle: {
    bg: "var(--surface-2)",
    border: "1px solid var(--border-row)",
    ring: "var(--fg-5)",
    label: "idle"
  },
  blocked: {
    bg: "var(--amber-soft)",
    border: "1px solid var(--amber)",
    ring: "var(--amber)",
    label: "blocked"
  }
};

function ActivityRing({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <svg width={48} height={48} viewBox="0 0 48 48" aria-hidden>
      <circle
        cx={24}
        cy={24}
        r={r}
        stroke="var(--surface-3)"
        strokeWidth={3}
        fill="none"
      />
      <circle
        cx={24}
        cy={24}
        r={r}
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <text
        x={24}
        y={27}
        textAnchor="middle"
        fontSize={11}
        fill="var(--fg-1)"
      >
        {label}
      </text>
    </svg>
  );
}

export function TopAgentCard({ agent }: { agent: AgentStatus }) {
  const tint = STATE_TINTS[agent.state];
  const demoNow = new Date(DEMO_NOW_ISO).getTime();
  const minutes = Math.max(0, (demoNow - new Date(agent.lastActivity).getTime()) / 60000);
  const pct = Math.max(0, Math.min(100, Math.round(100 - (minutes / (12 * 60)) * 100)));

  return (
    <Link
      href={`/agents/${agent.id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        background: tint.bg,
        border: tint.border,
        borderRadius: "var(--r-card)",
        padding: 14,
        gap: 10,
        textDecoration: "none",
        color: "inherit",
        minHeight: 160,
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--fg-3)",
              textTransform: "lowercase",
              letterSpacing: "0.01em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
            title={agent.role}
          >
            {agent.role}
          </div>
        </div>
        <ActivityRing pct={pct} color={tint.ring} label={formatRelative(agent.lastActivity)} />
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--fg-0)",
            letterSpacing: "-0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
          title={agent.name}
        >
          {agent.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--fg-3)",
            marginTop: 4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 32
          }}
          title={agent.deliberationTitle ?? "no active deliberation"}
        >
          {agent.deliberationTitle ?? "no active deliberation"}
        </div>
      </div>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "var(--fg-4)"
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: "var(--r-pill)",
              background: tint.ring
            }}
          />
          {tint.label}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--fg-2)",
            background: "var(--surface-1)",
            border: "1px solid var(--surface-2)",
            borderRadius: "var(--r-pill)",
            padding: "3px 10px"
          }}
        >
          View →
        </span>
      </div>
    </Link>
  );
}
