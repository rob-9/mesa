"use client";

import type { HitlGate } from "@/lib/types";

export type HitlState = "inactive" | "pending" | "accepted" | "declined";

interface HITLBannerProps {
  gate: HitlGate;
  state: HitlState;
  approver: SlackApprover;
  onForceAccept: () => void;
  onDecline: () => void;
  onOverride: () => void;
}

export interface SlackApprover {
  name: string;        // "K. Mehta"
  role: string;        // "legal-ops"
  channel: string;     // "#agent-approvals"
  pingedAt: string;    // pre-formatted clock, e.g. "14:24"
}

export function HITLBanner({
  gate,
  state,
  approver,
  onForceAccept,
  onDecline,
  onOverride
}: HITLBannerProps) {
  if (state === "inactive") return null;

  if (state === "accepted") {
    // Brief "authorized" flash — auto-dismissed by the parent.
    return (
      <div
        key="accepted"
        className="hitl-banner-in"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 18px",
          background: "var(--surface-1)",
          borderBottom: "1px solid var(--surface-2)",
          color: "var(--fg-3)",
          fontSize: 12
        }}
      >
        <span style={{ color: "var(--accent)", fontWeight: 600 }}>✓</span>
        <span style={{ color: "var(--fg-2)" }}>Authorized:</span>
        <span className="mono">{gate.policyBound}</span>
        <span style={{ marginLeft: "auto", color: "var(--fg-5)", fontSize: 11 }}>
          human-in-the-loop · ok to proceed
        </span>
      </div>
    );
  }

  if (state === "declined") {
    return (
      <div
        key="declined"
        className="hitl-banner-in"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 18px",
          background: "var(--surface-1)",
          borderBottom: "1px solid var(--amber-soft)",
          color: "var(--fg-2)",
          fontSize: 13
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "var(--r-inner)",
            background: "var(--amber-soft)",
            color: "var(--amber)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 600,
            flexShrink: 0
          }}
        >
          ⏸
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 500, color: "var(--fg-1)" }}>
            Outreach withdrawn — counter-terms not authorized
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--fg-5)" }}>
            {gate.policyBound}
          </div>
        </div>
        <button
          onClick={onOverride}
          style={{
            padding: "7px 13px",
            borderRadius: "var(--r-pill)",
            background: "var(--surface-2)",
            color: "var(--fg-2)",
            fontSize: 12,
            border: "1px solid var(--surface-3)"
          }}
        >
          Override and resume
        </button>
      </div>
    );
  }

  // pending — Slack-MCP outreach to internal approver.
  return (
    <div
      key="pending"
      className="hitl-banner-in"
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 16,
        padding: "14px 18px",
        background: "linear-gradient(90deg, var(--accent-strong-bg) 0%, var(--surface-2) 110%)",
        borderBottom: "1px solid var(--accent-strong-border)"
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "var(--r-inner)",
          background: "var(--accent-soft)",
          color: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 600,
          flexShrink: 0,
          marginTop: 2
        }}
      >
        !
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 10,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: "var(--accent)",
              fontWeight: 600
            }}
          >
            HITL · pinging human approver
          </span>
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--fg-4)",
              padding: "2px 8px",
              borderRadius: "var(--r-pill)",
              background: "var(--surface-1)",
              border: "1px solid var(--surface-3)"
            }}
          >
            {gate.policyBound}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            background: "var(--surface-0)",
            border: "1px solid var(--surface-2)",
            borderRadius: "var(--r-inner)",
            fontSize: 12,
            color: "var(--fg-2)"
          }}
        >
          <span
            aria-hidden
            className="slack-pulse-dot"
            style={{
              width: 8,
              height: 8,
              borderRadius: "var(--r-pill)",
              background: "var(--amber)",
              flexShrink: 0
            }}
          />
          <span className="mono" style={{ color: "var(--fg-3)", fontSize: 11 }}>
            slack-mcp
          </span>
          <span style={{ color: "var(--fg-5)" }}>·</span>
          <span style={{ color: "var(--fg-1)", fontWeight: 500 }}>{approver.name}</span>
          <span style={{ color: "var(--fg-4)" }}>{approver.role}</span>
          <span style={{ color: "var(--fg-5)" }}>·</span>
          <span className="mono" style={{ color: "var(--fg-4)" }}>{approver.channel}</span>
          <span style={{ marginLeft: "auto", color: "var(--fg-5)", fontSize: 11 }} className="mono">
            sent {approver.pingedAt} · awaiting response
          </span>
        </div>

        <div
          style={{
            color: "var(--fg-2)",
            fontSize: 12,
            lineHeight: 1.5,
            paddingLeft: 2
          }}
        >
          <span style={{ color: "var(--fg-4)" }}>“</span>
          {gate.prompt}
          <span style={{ color: "var(--fg-4)" }}>”</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flexShrink: 0,
          alignItems: "stretch",
          justifyContent: "center",
          minWidth: 132
        }}
      >
        <button
          onClick={onForceAccept}
          style={{
            padding: "8px 14px",
            borderRadius: "var(--r-pill)",
            background: "var(--accent)",
            color: "#1a0e08",
            fontSize: 12,
            fontWeight: 600,
            border: "1px solid var(--accent)"
          }}
        >
          Force accept
        </button>
        <button
          onClick={onDecline}
          style={{
            padding: "7px 13px",
            borderRadius: "var(--r-pill)",
            background: "var(--surface-1)",
            color: "var(--fg-3)",
            fontSize: 11,
            border: "1px solid var(--surface-3)"
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
