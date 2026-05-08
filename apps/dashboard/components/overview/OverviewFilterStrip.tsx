"use client";

import type { CSSProperties } from "react";
import type { AgentStatus, IntegrationStatus, RiskPulse } from "@/lib/types";

export type StateFilter = AgentStatus["state"] | "all";
export type KpiFilter = "none" | "flagged" | "policy24h" | "stale";

interface OverviewFilterStripProps {
  risk: RiskPulse;
  integrations: IntegrationStatus[];
  stateFilter: StateFilter;
  kpiFilter: KpiFilter;
  onStateFilter: (next: StateFilter) => void;
  onKpiFilter: (next: KpiFilter) => void;
  onClear: () => void;
}

const chipBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 11px",
  borderRadius: "var(--r-pill)",
  fontSize: 12,
  border: "1px solid transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
  fontFamily: "inherit",
  lineHeight: 1.3
};

function Chip({
  active,
  bg,
  fg,
  borderColor,
  onClick,
  children
}: {
  active: boolean;
  bg: string;
  fg: string;
  borderColor?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...chipBase,
        background: bg,
        color: fg,
        borderColor: active ? (borderColor ?? "var(--accent-ring)") : "transparent",
        boxShadow: active ? "0 0 0 1px var(--accent-ring)" : "none"
      }}
    >
      {children}
    </button>
  );
}

export function OverviewFilterStrip({
  risk,
  integrations,
  stateFilter,
  kpiFilter,
  onStateFilter,
  onKpiFilter,
  onClear
}: OverviewFilterStripProps) {
  const connected = integrations.filter((i) => i.connected).length;
  const stateLabel =
    stateFilter === "all"
      ? "State"
      : stateFilter[0].toUpperCase() + stateFilter.slice(1);
  const cycleState = () => {
    const order: StateFilter[] = ["all", "negotiating", "idle", "blocked"];
    const idx = order.indexOf(stateFilter);
    onStateFilter(order[(idx + 1) % order.length]);
  };
  const anyActive = kpiFilter !== "none" || stateFilter !== "all";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
        flexShrink: 0
      }}
    >
      <Chip
        active={kpiFilter === "flagged"}
        bg="var(--amber-soft)"
        fg="var(--amber)"
        borderColor="var(--amber)"
        onClick={() => onKpiFilter(kpiFilter === "flagged" ? "none" : "flagged")}
      >
        Flagged
        <span className="mono" style={{ fontSize: 11, opacity: 0.85 }}>
          {risk.flaggedOpen}
        </span>
      </Chip>
      <Chip
        active={kpiFilter === "policy24h"}
        bg="var(--accent-soft)"
        fg="var(--accent)"
        onClick={() => onKpiFilter(kpiFilter === "policy24h" ? "none" : "policy24h")}
      >
        Policy fires 24h
        <span className="mono" style={{ fontSize: 11, opacity: 0.85 }}>
          {risk.policyFires24h}
        </span>
      </Chip>
      <Chip
        active={kpiFilter === "stale"}
        bg="var(--surface-2)"
        fg="var(--fg-3)"
        onClick={() => onKpiFilter(kpiFilter === "stale" ? "none" : "stale")}
      >
        Stale &gt;7d
        <span className="mono" style={{ fontSize: 11, opacity: 0.85 }}>
          {risk.staleOver7d}
        </span>
      </Chip>

      <span
        aria-hidden
        style={{
          width: 1,
          alignSelf: "stretch",
          background: "var(--surface-2)",
          margin: "0 4px"
        }}
      />

      <Chip
        active={false}
        bg="var(--surface-2)"
        fg="var(--fg-2)"
        onClick={() => {}}
      >
        Integrations
        <span className="mono" style={{ fontSize: 11, color: "var(--fg-4)" }}>
          {connected}/{integrations.length}
        </span>
      </Chip>
      <Chip
        active={stateFilter !== "all"}
        bg="var(--surface-2)"
        fg="var(--fg-2)"
        onClick={cycleState}
      >
        {stateLabel}
        <span style={{ fontSize: 10, color: "var(--fg-4)" }}>▾</span>
      </Chip>

      {anyActive && (
        <button
          type="button"
          onClick={onClear}
          style={{
            ...chipBase,
            background: "transparent",
            color: "var(--fg-4)",
            borderColor: "var(--surface-2)"
          }}
        >
          × Clear
        </button>
      )}
    </div>
  );
}
