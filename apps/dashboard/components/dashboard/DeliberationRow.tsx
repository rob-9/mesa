import Link from "next/link";
import { StagePill } from "@/components/primitives/StagePill";
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
  const waitingColor =
    d.waitingOn.party === "you" || d.flagged
      ? d.flagged
        ? "var(--amber)"
        : "var(--accent)"
      : d.waitingOn.party === "agent"
      ? "var(--accent)"
      : "var(--fg-4)";

  return (
    <Link
      href={`/deliberations/${d.id}`}
      style={{
        display: "grid",
        gridTemplateColumns: gridTemplate,
        gap: 14,
        padding: "14px 20px",
        borderBottom: isLast ? "none" : "1px solid #1d1916",
        alignItems: "center",
        fontSize: 13,
        color: "var(--fg-1)",
        transition: "background 0.1s"
      }}
    >
      <span style={{ color: "var(--fg-0)" }}>{d.title}</span>
      <span className="mono" style={{ color: "var(--fg-3)", fontSize: 12 }}>{d.counterparty}</span>
      <span><StagePill stage={d.stage} flagged={d.flagged} /></span>
      <span className="mono" style={{ fontSize: 12, color: waitingColor }}>{waitingOnLabel}</span>
      <span className="mono" style={{ textAlign: "right" }}>{d.commitmentCount}</span>
      <span className="mono" style={{ textAlign: "right", color: "var(--fg-4)", fontSize: 12 }}>
        {formatRelative(d.lastActivity)}
      </span>
    </Link>
  );
}
