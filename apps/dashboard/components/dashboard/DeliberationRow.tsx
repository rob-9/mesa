import Link from "next/link";
import { ProgressDots } from "@/components/primitives/ProgressDots";
import { formatRelative } from "@/lib/format";
import type { Deliberation } from "@/lib/types";

interface RowProps {
  deliberation: Deliberation;
  isLast: boolean;
  gridTemplate: string;
}

export function DeliberationRow({ deliberation, isLast, gridTemplate }: RowProps) {
  const d = deliberation;
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
      style={{
        display: "block",
        padding: "16px 20px",
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
        <span style={{ color: "var(--fg-0)", fontWeight: 500 }}>{d.title}</span>
        <span style={{ color: "var(--fg-3)", fontSize: 13 }}>{d.counterparty}</span>
        <span><ProgressDots stage={d.stage} flagged={d.flagged} /></span>
        <span className="mono" style={{ fontSize: 12, color: waitingColor }}>{waitingOnLabel}</span>
        <span className="mono" style={{ textAlign: "right", color: "var(--fg-4)", fontSize: 12 }}>
          {formatRelative(d.lastActivity)}
        </span>
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 12,
          color: "var(--fg-4)",
          lineHeight: 1.5,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {d.latestSummary}
      </div>
    </Link>
  );
}
