"use client";

import type { PostSignoffTask } from "@/lib/types";

export type PostSignoffStatus = "queued" | "pinging" | "resolved";

export interface PostSignoffEntry {
  task: PostSignoffTask;
  status: PostSignoffStatus;
  resolvedAt?: string;     // pre-formatted clock when status=resolved
}

interface PostSignoffStripProps {
  entries: PostSignoffEntry[];
  onSignoff: () => void;
}

export function PostSignoffStrip({ entries, onSignoff }: PostSignoffStripProps) {
  return (
    <div
      className="post-signoff-strip-in"
      role="region"
      aria-live="polite"
      aria-label="Post-signoff fan-out"
      style={{
        borderTop: "1px solid var(--surface-2)",
        background: "var(--surface-0)",
        padding: "12px 22px 14px"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10
        }}
      >
        <FanOutIcon />
        <span
          className="mono"
          style={{
            fontSize: 11,
            color: "var(--fg-3)",
            letterSpacing: "0.08em"
          }}
        >
          POST-SIGNOFF · LAB-BUYER-AGENT FAN-OUT
        </span>
        <span style={{ color: "var(--fg-5)", fontSize: 11 }}>·</span>
        <span style={{ color: "var(--fg-4)", fontSize: 11 }}>
          {entries.length} downstream {entries.length === 1 ? "handoff" : "handoffs"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {entries.map((entry, i) => (
          <PostSignoffRow
            key={entry.task.id}
            entry={entry}
            index={i}
            onSignoff={onSignoff}
          />
        ))}
      </div>
    </div>
  );
}

function PostSignoffRow({
  entry,
  index,
  onSignoff
}: {
  entry: PostSignoffEntry;
  index: number;
  onSignoff: () => void;
}) {
  const isHuman = entry.task.kind === "human_signoff";
  const accentBorder = isHuman && entry.status !== "resolved";

  return (
    <div
      className="post-signoff-row-in"
      style={{
        animationDelay: `${index * 90}ms`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 12px",
        background: "var(--surface-1)",
        border: accentBorder
          ? "1px solid var(--accent-strong-border)"
          : "1px solid var(--surface-2)",
        borderRadius: "var(--r-inner)",
        fontSize: 12
      }}
    >
      <StatusGlyph status={entry.status} accent={isHuman} />
      <KindTag kind={entry.task.kind} />
      <span style={{ color: "var(--fg-1)", fontWeight: 500, flexShrink: 0 }}>
        {isHuman ? "you · principal" : entry.task.agent}
      </span>
      <span style={{ color: "var(--fg-4)", flex: 1, minWidth: 0 }}>
        {entry.task.deliverable}
      </span>
      <span
        className="mono"
        style={{
          fontSize: 10,
          color: "var(--fg-5)",
          padding: "2px 7px",
          borderRadius: "var(--r-pill)",
          background: "var(--surface-0)",
          border: "1px solid var(--surface-2)",
          flexShrink: 0
        }}
      >
        from {entry.task.derivedFromCommitment}
      </span>
      <RowAction entry={entry} onSignoff={onSignoff} />
    </div>
  );
}

function RowAction({
  entry,
  onSignoff
}: {
  entry: PostSignoffEntry;
  onSignoff: () => void;
}) {
  if (entry.status === "resolved") {
    return (
      <span
        className="mono"
        style={{
          fontSize: 11,
          color: "var(--fg-4)",
          flexShrink: 0,
          minWidth: 86,
          textAlign: "right"
        }}
      >
        resolved · {entry.resolvedAt ?? "—"}
      </span>
    );
  }
  if (entry.task.kind === "human_signoff") {
    return (
      <button
        type="button"
        onClick={onSignoff}
        aria-label={`Sign off — ${entry.task.deliverable}`}
        style={{
          padding: "6px 14px",
          borderRadius: "var(--r-pill)",
          background: "var(--accent)",
          color: "#1a0e08",
          fontSize: 11,
          fontWeight: 600,
          border: "1px solid var(--accent)",
          flexShrink: 0,
          minWidth: 86,
          cursor: "pointer"
        }}
      >
        Sign off
      </button>
    );
  }
  return (
    <span
      className="mono"
      style={{
        fontSize: 11,
        color: "var(--fg-4)",
        flexShrink: 0,
        minWidth: 86,
        textAlign: "right"
      }}
    >
      {entry.status === "pinging" ? "pinging…" : "queued"}
    </span>
  );
}

function StatusGlyph({ status, accent }: { status: PostSignoffStatus; accent: boolean }) {
  if (status === "resolved") {
    return (
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
    );
  }
  if (status === "pinging") {
    return (
      <span
        aria-hidden
        className="slack-pulse-dot"
        style={{
          width: 8,
          height: 8,
          borderRadius: "var(--r-pill)",
          background: "var(--amber)",
          flexShrink: 0,
          marginLeft: 5,
          marginRight: 5
        }}
      />
    );
  }
  // queued
  return (
    <span
      aria-hidden
      style={{
        width: 8,
        height: 8,
        borderRadius: "var(--r-pill)",
        background: accent ? "var(--accent-ring)" : "var(--fg-6)",
        flexShrink: 0,
        marginLeft: 5,
        marginRight: 5
      }}
    />
  );
}

function KindTag({ kind }: { kind: PostSignoffTask["kind"] }) {
  const isHuman = kind === "human_signoff";
  return (
    <span
      className="mono"
      style={{
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: "var(--r-pill)",
        background: isHuman ? "var(--accent-soft)" : "var(--surface-2)",
        color: isHuman ? "var(--accent)" : "var(--fg-3)",
        letterSpacing: "0.04em",
        flexShrink: 0
      }}
    >
      {isHuman ? "hitl" : "agent2agent"}
    </span>
  );
}

// Three little arrows fanning out from a single source — visual cue that
// one agent is reaching multiple downstream parties at once.
function FanOutIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      stroke="var(--accent)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx={4} cy={9} r={1.5} fill="var(--accent)" />
      <path d="M5.5 9 L13 4" />
      <path d="M5.5 9 L13 9" />
      <path d="M5.5 9 L13 14" />
      <circle cx={14} cy={4} r={1} fill="var(--accent-soft)" />
      <circle cx={14} cy={9} r={1} fill="var(--accent-soft)" />
      <circle cx={14} cy={14} r={1} fill="var(--accent-soft)" />
    </svg>
  );
}
