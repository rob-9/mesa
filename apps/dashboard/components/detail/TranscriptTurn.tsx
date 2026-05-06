import { useCallback } from "react";
import { formatClock } from "@/lib/format";
import type { Turn } from "@/lib/types";

interface TranscriptTurnProps {
  turn: Turn;
  highlighted: boolean;
  registerRef: (id: number, el: HTMLDivElement | null) => void;
}

// Speaker placement: 'lab' is the buyer (X's side) → right. Anyone else → left.
function isSelf(speaker: string): boolean {
  return speaker === "lab";
}

export function TranscriptTurn({ turn, highlighted, registerRef }: TranscriptTurnProps) {
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      registerRef(turn.id, el);
    },
    [registerRef, turn.id]
  );

  const right = isSelf(turn.speaker);
  const wrapAlign = right ? "flex-end" : "flex-start";
  const headerOrder = right ? "row-reverse" : "row";

  // Bubble palette
  const bg = highlighted
    ? "var(--accent-strong-bg)"
    : right
    ? "var(--surface-2)"
    : "var(--surface-1)";
  const border = highlighted
    ? "1px solid var(--accent)"
    : "1px solid var(--surface-2)";
  const textColor = highlighted ? "var(--fg-0)" : right ? "var(--fg-1)" : "var(--fg-2)";

  // Asymmetric corner radii so the bubble "points" toward its speaker side.
  const radius = right
    ? "14px 14px 4px 14px" // right speaker, the corner closest to the gutter is the bottom-right (smaller)
    : "14px 14px 14px 4px"; // left speaker, the corner closest to the gutter is the bottom-left

  return (
    <div
      ref={setRef}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: wrapAlign,
        marginBottom: 14,
        scrollMarginTop: 16
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: headerOrder,
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
          fontSize: 11,
          color: highlighted ? "var(--accent)" : "var(--fg-4)"
        }}
      >
        <TurnBadge id={turn.id} highlighted={highlighted} />
        <span style={{ color: highlighted ? "var(--accent)" : "var(--fg-3)", fontWeight: highlighted ? 500 : 400 }}>
          {turn.speaker}
        </span>
        <span style={{ color: "var(--fg-5)" }}>·</span>
        <span className="mono" style={{ color: highlighted ? "var(--accent)" : "var(--fg-5)" }}>
          {formatClock(turn.timestamp)}
        </span>
      </div>
      <div
        style={{
          maxWidth: "82%",
          padding: "10px 14px",
          background: bg,
          border,
          borderRadius: radius,
          color: textColor,
          fontSize: 13,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word"
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
