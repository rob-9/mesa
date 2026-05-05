import { useCallback } from "react";
import { formatClock } from "@/lib/format";
import type { Turn } from "@/lib/types";

interface TranscriptTurnProps {
  turn: Turn;
  highlighted: boolean;
  registerRef: (id: number, el: HTMLDivElement | null) => void;
}

export function TranscriptTurn({ turn, highlighted, registerRef }: TranscriptTurnProps) {
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      registerRef(turn.id, el);
    },
    [registerRef, turn.id]
  );

  return (
    <div
      ref={setRef}
      style={{
        margin: highlighted ? "0 -12px 16px" : "0 0 16px",
        padding: highlighted ? "10px 12px" : 0,
        borderLeft: highlighted ? "2px solid var(--accent)" : "none",
        borderRadius: highlighted ? "var(--r-inner)" : 0,
        background: highlighted ? "var(--accent-strong-bg)" : "transparent",
        transition: "background 0.15s, padding 0.15s"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 11,
          marginBottom: 4
        }}
      >
        <TurnBadge id={turn.id} highlighted={highlighted} />
        <span style={{ color: highlighted ? "var(--accent)" : "var(--fg-4)", fontWeight: highlighted ? 500 : 400 }}>
          {turn.speaker}
        </span>
        <span style={{ color: "var(--fg-5)" }}>·</span>
        <span className="mono" style={{ color: highlighted ? "var(--accent)" : "var(--fg-5)" }}>
          {formatClock(turn.timestamp)}
        </span>
      </div>
      <div
        style={{
          color: highlighted ? "var(--fg-0)" : "var(--fg-2)",
          fontSize: 13,
          lineHeight: 1.55
        }}
      >
        {turn.content}
      </div>
    </div>
  );
}

// Shared between transcript turns and commitment provenance lines.
// This is the visual anchor that makes the headline interaction unmissable.
export function TurnBadge({ id, highlighted }: { id: number; highlighted: boolean }) {
  return (
    <span
      className="mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "var(--r-pill)",
        background: highlighted ? "var(--accent)" : "var(--surface-2)",
        color: highlighted ? "var(--bg)" : "var(--fg-3)",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.02em"
      }}
    >
      Turn {id}
    </span>
  );
}
