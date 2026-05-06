import type { Turn } from "@/lib/types";
import { TranscriptTurn } from "./TranscriptTurn";

interface TranscriptPaneProps {
  turns: Turn[];
  highlightedTurnIds: Set<number>;
  registerTurnRef: (id: number, el: HTMLDivElement | null) => void;
}

export function TranscriptPane({ turns, highlightedTurnIds, registerTurnRef }: TranscriptPaneProps) {
  return (
    <div
      style={{
        borderRight: "1px solid var(--surface-2)",
        overflowY: "auto",
        overscrollBehavior: "none",
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-0)"
      }}
    >
      <div
        style={{
          padding: "12px 22px",
          borderBottom: "1px solid var(--surface-2)",
          position: "sticky",
          top: 0,
          background: "var(--surface-0)",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}
      >
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: "var(--r-pill)",
            background: "rgba(140, 160, 200, 0.9)",
            boxShadow: "0 0 0 3px rgba(140, 160, 200, 0.18)"
          }}
        />
        <span
          className="mono"
          style={{
            fontSize: 11,
            color: "var(--fg-3)",
            letterSpacing: "0.08em"
          }}
        >
          TRANSCRIPT
        </span>
      </div>
      <div style={{ padding: "16px 22px" }}>
        {turns.length === 0 && (
          <div style={{ color: "var(--fg-4)", fontSize: 13 }}>
            No transcript turns recorded yet.
          </div>
        )}
        {turns.map((turn) => (
          <TranscriptTurn
            key={turn.id}
            turn={turn}
            highlighted={highlightedTurnIds.has(turn.id)}
            registerRef={registerTurnRef}
          />
        ))}
      </div>
    </div>
  );
}
