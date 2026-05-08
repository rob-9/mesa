import Link from "next/link";
import { ProgressDots } from "@/components/primitives/ProgressDots";
import { formatRelative } from "@/lib/format";
import type { Deliberation } from "@/lib/types";

interface MostRecentCardsProps {
  deliberations: Deliberation[];
}

export function MostRecentCards({ deliberations }: MostRecentCardsProps) {
  const top = [...deliberations]
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
    .slice(0, 3);

  if (top.length === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${top.length}, minmax(0, 1fr))`,
        gap: 12,
        marginBottom: 18
      }}
    >
      {top.map((d) => (
        <MostRecentCard key={d.id} deliberation={d} />
      ))}
    </div>
  );
}

function MostRecentCard({ deliberation: d }: { deliberation: Deliberation }) {
  const waitingOnLabel =
    d.waitingOn.party === "agent" ? d.waitingOn.agent ?? "agent" : d.waitingOn.party;
  const waitingColor = d.flagged
    ? "var(--amber)"
    : d.waitingOn.party === "you"
    ? "var(--accent)"
    : "var(--fg-4)";

  return (
    <Link
      href={`/deliberations/${d.id}`}
      className="row-link"
      style={{
        display: "block",
        background: "var(--surface-0)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        padding: "14px 16px",
        textDecoration: "none",
        color: "inherit",
        minWidth: 0
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 8
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--fg-0)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {d.title}
        </span>
        <span
          className="mono"
          style={{ fontSize: 11, color: "var(--fg-4)", flexShrink: 0 }}
        >
          {formatRelative(d.lastActivity)}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
          fontSize: 12,
          color: "var(--fg-3)"
        }}
      >
        <span>{d.counterparty}</span>
        <span style={{ color: "var(--fg-5)" }}>·</span>
        <ProgressDots stage={d.stage} flagged={d.flagged} />
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--fg-4)",
          lineHeight: 1.5,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          marginBottom: 8
        }}
      >
        {d.latestSummary}
      </div>
      <div
        className="mono"
        style={{
          fontSize: 11,
          color: waitingColor,
          letterSpacing: "0.04em"
        }}
      >
        waiting on · {waitingOnLabel}
      </div>
    </Link>
  );
}
