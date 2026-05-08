"use client";

import { useEffect, useRef } from "react";
import type { Turn } from "@/lib/types";
import { TranscriptTurn } from "./TranscriptTurn";
import { TypingIndicator } from "./TypingIndicator";

export interface AuditEvent {
  afterTurn: number;             // render between this turn and the next
  kind: "hitl_approved";
  source: "slack" | "operator" | "replay";
  label: string;                 // body of the audit line
  actor: string;                 // who authorized
  timestamp: string;             // pre-formatted clock
}

interface TranscriptPaneProps {
  turns: Turn[];
  highlightedTurnIds: Set<number>;
  registerTurnRef: (id: number, el: HTMLDivElement | null) => void;
  stickToBottom?: boolean;
  animateIn?: boolean;
  typingSpeaker?: string | null;
  auditEvent?: AuditEvent | null;
}

export function TranscriptPane({
  turns,
  highlightedTurnIds,
  registerTurnRef,
  stickToBottom = false,
  animateIn = false,
  typingSpeaker = null,
  auditEvent = null
}: TranscriptPaneProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // Track whether the reader has scrolled away from the tail. While they are
  // reading earlier turns we DO NOT yank them back to the bottom on each new
  // streamed turn — that's the worst part of most live chat UIs.
  const pinnedToBottomRef = useRef<boolean>(true);

  useEffect(() => {
    if (!stickToBottom) return;
    const el = scrollRef.current;
    if (!el) return;
    if (!pinnedToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [stickToBottom, turns.length, typingSpeaker, auditEvent]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    pinnedToBottomRef.current = distanceFromBottom < 64;
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      role="log"
      aria-live={stickToBottom ? "polite" : "off"}
      aria-relevant="additions"
      aria-label={stickToBottom ? "Live deliberation transcript" : "Deliberation transcript"}
      style={{
        borderRight: "1px solid var(--surface-2)",
        overflowY: "auto",
        overscrollBehavior: "contain",
        scrollBehavior: "smooth",
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-0)",
        minHeight: 0
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
          <div
            className="transcript-turn-in"
            style={{
              color: "var(--fg-4)",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 0"
            }}
          >
            {stickToBottom && (
              <span
                aria-hidden
                className="live-pulse-dot"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "var(--r-pill)",
                  background: "rgba(120, 200, 140, 0.95)",
                  flexShrink: 0
                }}
              />
            )}
            {stickToBottom ? "Connecting to agents — first turn incoming…" : "No transcript turns recorded yet."}
          </div>
        )}
        {turns.map((turn) => (
          <div key={turn.id}>
            <TranscriptTurn
              turn={turn}
              highlighted={highlightedTurnIds.has(turn.id)}
              registerRef={registerTurnRef}
              animateIn={animateIn}
            />
            {auditEvent && auditEvent.afterTurn === turn.id && (
              <AuditLine event={auditEvent} animateIn={animateIn} />
            )}
          </div>
        ))}
        {typingSpeaker && <TypingIndicator speaker={typingSpeaker} />}
      </div>
    </div>
  );
}

function AuditLine({ event, animateIn }: { event: AuditEvent; animateIn: boolean }) {
  const sourceTag =
    event.source === "slack"
      ? "slack-mcp"
      : event.source === "operator"
      ? "force-accept"
      : "replay";
  return (
    <div
      className={animateIn ? "transcript-audit-in" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "10px 0 18px",
        padding: "8px 12px",
        borderRadius: "var(--r-inner)",
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)"
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "var(--r-pill)",
          background: "var(--accent-soft)",
          color: "var(--accent)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 600,
          flexShrink: 0
        }}
      >
        ✓
      </span>
      <span
        className="mono"
        style={{
          fontSize: 10,
          padding: "2px 8px",
          borderRadius: "var(--r-pill)",
          background: "var(--surface-2)",
          color: "var(--fg-3)",
          letterSpacing: "0.04em",
          flexShrink: 0
        }}
      >
        {sourceTag}
      </span>
      <span style={{ color: "var(--fg-1)", fontSize: 12, fontWeight: 500 }}>{event.actor}</span>
      <span style={{ color: "var(--fg-4)", fontSize: 12 }}>{event.label}</span>
      <span
        className="mono"
        style={{ marginLeft: "auto", color: "var(--fg-5)", fontSize: 11, flexShrink: 0 }}
      >
        {event.timestamp}
      </span>
    </div>
  );
}
