"use client";

import { useEffect, useRef } from "react";
import type { Turn } from "@/lib/types";
import { TranscriptTurn } from "./TranscriptTurn";
import { TypingIndicator } from "./TypingIndicator";

interface TranscriptPaneProps {
  turns: Turn[];
  highlightedTurnIds: Set<number>;
  registerTurnRef: (id: number, el: HTMLDivElement | null) => void;
  stickToBottom?: boolean;
  animateIn?: boolean;
  typingSpeaker?: string | null;
}

export function TranscriptPane({
  turns,
  highlightedTurnIds,
  registerTurnRef,
  stickToBottom = false,
  animateIn = false,
  typingSpeaker = null
}: TranscriptPaneProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!stickToBottom) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [stickToBottom, turns.length, typingSpeaker]);

  return (
    <div
      ref={scrollRef}
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
          padding: "10px 22px",
          minHeight: 44,
          borderBottom: "1px solid var(--surface-2)",
          position: "sticky",
          top: 0,
          background: "var(--surface-0)",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxSizing: "border-box",
          lineHeight: 1
        }}
      >
        <span
          aria-hidden
          className={stickToBottom ? "live-pulse-dot" : undefined}
          style={{
            width: 8,
            height: 8,
            borderRadius: "var(--r-pill)",
            background: stickToBottom ? "rgba(120, 200, 140, 0.95)" : "rgba(140, 160, 200, 0.9)",
            boxShadow: stickToBottom
              ? "0 0 0 3px rgba(120, 200, 140, 0.22)"
              : "0 0 0 3px rgba(140, 160, 200, 0.18)"
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
          {stickToBottom ? "TRANSCRIPT · LIVE" : "TRANSCRIPT"}
        </span>
      </div>
      <div style={{ padding: "16px 22px" }}>
        {turns.length === 0 && !typingSpeaker && (
          <div style={{ color: "var(--fg-4)", fontSize: 13 }}>
            {stickToBottom ? "Waiting for the first turn…" : "No transcript turns recorded yet."}
          </div>
        )}
        {turns.map((turn) => (
          <TranscriptTurn
            key={turn.id}
            turn={turn}
            highlighted={highlightedTurnIds.has(turn.id)}
            registerRef={registerTurnRef}
            animateIn={animateIn}
          />
        ))}
        {typingSpeaker && <TypingIndicator speaker={typingSpeaker} />}
      </div>
    </div>
  );
}
