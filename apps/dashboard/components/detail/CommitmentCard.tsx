import { useEffect, useRef } from "react";
import { TypeLabel } from "@/components/primitives/TypeLabel";
import type { Commitment } from "@/lib/types";
import { TurnBadge } from "./TranscriptTurn";

interface CommitmentCardProps {
  commitment: Commitment;
  selected: boolean;
  onSelect: () => void;
  animateIn?: boolean;
}

export function CommitmentCard({ commitment, selected, onSelect, animateIn = false }: CommitmentCardProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  // 200ms one-shot scale-pulse on selection so the click is visibly registered
  // even on a recorded video. We re-trigger by re-applying the animation class.
  useEffect(() => {
    if (!selected || !ref.current) return;
    const el = ref.current;
    el.style.animation = "none";
    // Force reflow so the animation re-fires.
    void el.offsetHeight;
    el.style.animation = "mesa-pulse 200ms ease-out";
  }, [selected]);

  const isPending = commitment.status === "pending";
  const statusColor =
    commitment.status === "pending"
      ? "var(--accent)"
      : commitment.status === "flagged"
      ? "var(--amber)"
      : "var(--fg-5)";

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      className={animateIn ? "commitment-card-in" : undefined}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        border: selected
          ? "1px solid var(--accent)"
          : isPending
          ? "1px dashed var(--surface-3)"
          : "1px solid var(--surface-2)",
        background: selected ? "var(--accent-strong-bg)" : "transparent",
        boxShadow: selected ? "0 0 0 3px var(--accent-ring)" : "none",
        borderRadius: "var(--r-inner)",
        padding: "12px 14px",
        marginBottom: 10,
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6
        }}
      >
        <TypeLabel type={commitment.type} selected={selected} />
        <span className="mono" style={{ fontSize: 10, color: statusColor }}>
          {commitment.status === "pending" ? "awaiting human" : commitment.status}
        </span>
      </div>
      <div
        style={{
          fontSize: 13,
          color: selected ? "var(--fg-0)" : "var(--fg-2)",
          lineHeight: 1.5,
          marginBottom: 8
        }}
      >
        {commitment.summary}
      </div>
      {commitment.derivedFromTurns.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            paddingTop: 8,
            borderTop: selected ? "1px solid var(--accent-strong-border)" : "1px solid var(--surface-2)",
            fontSize: 11,
            color: selected ? "var(--accent)" : "var(--fg-5)"
          }}
        >
          <span>derived from</span>
          {commitment.derivedFromTurns.map((id) => (
            <TurnBadge key={id} id={id} highlighted={selected} />
          ))}
        </div>
      )}
    </button>
  );
}
