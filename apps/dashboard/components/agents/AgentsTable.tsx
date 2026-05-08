"use client";

import { useMemo, useState } from "react";
import type { AgentDetail } from "@/lib/types";
import { Icon } from "@/components/icons/Icon";
import { AgentRow } from "./AgentRow";

const GRID = "minmax(0, 1.4fr) 130px 110px minmax(0, 1.2fr) 80px";

type SortKey = "name" | "role" | "state" | "lastActivity";
type SortDir = "asc" | "desc";

const stateRank: Record<AgentDetail["state"], number> = {
  blocked: 0,
  negotiating: 1,
  idle: 2
};

const stateGroupLabel: Record<AgentDetail["state"], string> = {
  blocked: "BLOCKED",
  negotiating: "NEGOTIATING",
  idle: "IDLE"
};

function compareAgents(a: AgentDetail, b: AgentDetail, key: SortKey, dir: SortDir): number {
  const m = dir === "asc" ? 1 : -1;
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name) * m;
    case "role":
      return a.role.localeCompare(b.role) * m;
    case "state": {
      const d = stateRank[a.state] - stateRank[b.state];
      if (d !== 0) return d * m;
      return Date.parse(b.lastActivity) - Date.parse(a.lastActivity);
    }
    case "lastActivity":
      return (Date.parse(a.lastActivity) - Date.parse(b.lastActivity)) * m;
  }
}

export function AgentsTable({ agents }: { agents: AgentDetail[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("state");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [grouped, setGrouped] = useState(true);

  const sorted = useMemo(
    () => [...agents].sort((a, b) => compareAgents(a, b, sortKey, sortDir)),
    [agents, sortKey, sortDir]
  );

  const groups = useMemo(() => {
    if (!grouped) return null;
    const order: AgentDetail["state"][] = ["blocked", "negotiating", "idle"];
    return order
      .map((state) => ({
        state,
        agents: agents
          .filter((a) => a.state === state)
          .sort((a, b) => Date.parse(b.lastActivity) - Date.parse(a.lastActivity))
      }))
      .filter((g) => g.agents.length > 0);
  }, [agents, grouped]);

  function onHeaderClick(key: SortKey) {
    if (grouped) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "lastActivity" ? "desc" : "asc");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Toolbar grouped={grouped} setGrouped={setGrouped} />
      <div
        style={{
          background: "var(--surface-0)",
          border: "1px solid var(--surface-2)",
          borderRadius: "var(--r-card)",
          overflow: "hidden"
        }}
      >
        <HeaderRow
          sortKey={sortKey}
          sortDir={sortDir}
          onClick={onHeaderClick}
          interactive={!grouped}
        />
        <div>
          {grouped && groups
            ? groups.map((g) => (
                <div key={g.state}>
                  <div
                    className="mono"
                    style={{
                      padding: "8px 20px",
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      color: "var(--fg-5)",
                      background: "var(--surface-1)",
                      borderTop: "1px solid var(--surface-2)",
                      borderBottom: "1px solid var(--surface-2)"
                    }}
                  >
                    {stateGroupLabel[g.state]} · {g.agents.length}
                  </div>
                  {g.agents.map((a, i) => (
                    <AgentRow
                      key={a.id}
                      agent={a}
                      isLast={i === g.agents.length - 1}
                      gridTemplate={GRID}
                    />
                  ))}
                </div>
              ))
            : sorted.map((a, i) => (
                <AgentRow
                  key={a.id}
                  agent={a}
                  isLast={i === sorted.length - 1}
                  gridTemplate={GRID}
                />
              ))}
        </div>
      </div>
    </div>
  );
}

function Toolbar({ grouped, setGrouped }: { grouped: boolean; setGrouped: (g: boolean) => void }) {
  return (
    <div role="group" aria-label="Agents view" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
      <span style={{ color: "var(--fg-5)", marginRight: 4 }}>view</span>
      <ToggleButton active={!grouped} onClick={() => setGrouped(false)}>Sort</ToggleButton>
      <ToggleButton active={grouped} onClick={() => setGrouped(true)}>Group by state</ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        height: 24,
        padding: "0 10px",
        borderRadius: "var(--r-pill)",
        border: `1px solid ${active ? "var(--surface-3)" : "var(--surface-2)"}`,
        background: active ? "var(--surface-2)" : "transparent",
        color: active ? "var(--fg-0)" : "var(--fg-4)",
        fontSize: 11,
        cursor: "pointer"
      }}
    >
      {children}
    </button>
  );
}

function HeaderRow({
  sortKey,
  sortDir,
  onClick,
  interactive
}: {
  sortKey: SortKey;
  sortDir: SortDir;
  onClick: (k: SortKey) => void;
  interactive: boolean;
}) {
  return (
    <div
      className="mono"
      style={{
        flexShrink: 0,
        display: "grid",
        gridTemplateColumns: GRID,
        gap: 14,
        padding: "12px 20px",
        fontSize: 11,
        color: "var(--fg-5)",
        letterSpacing: "0.06em",
        borderBottom: "1px solid var(--surface-2)"
      }}
    >
      <HeaderCell label="AGENT" k="name" sortKey={sortKey} sortDir={sortDir} onClick={onClick} interactive={interactive} />
      <HeaderCell label="ROLE" k="role" sortKey={sortKey} sortDir={sortDir} onClick={onClick} interactive={interactive} />
      <HeaderCell label="STATE" k="state" sortKey={sortKey} sortDir={sortDir} onClick={onClick} interactive={interactive} />
      <span>CURRENT DELIBERATION</span>
      <HeaderCell label="LAST" k="lastActivity" sortKey={sortKey} sortDir={sortDir} onClick={onClick} interactive={interactive} align="right" />
    </div>
  );
}

function HeaderCell({
  label,
  k,
  sortKey,
  sortDir,
  onClick,
  interactive,
  align
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onClick: (k: SortKey) => void;
  interactive: boolean;
  align?: "right";
}) {
  const active = interactive && sortKey === k;
  const ariaSort: "ascending" | "descending" | "none" = active
    ? sortDir === "asc"
      ? "ascending"
      : "descending"
    : "none";
  return (
    <button
      type="button"
      onClick={() => onClick(k)}
      disabled={!interactive}
      aria-sort={ariaSort}
      aria-label={
        interactive
          ? `Sort by ${label.toLowerCase()}${active ? `, currently ${ariaSort}` : ""}`
          : undefined
      }
      style={{
        all: "unset",
        cursor: interactive ? "pointer" : "default",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: align === "right" ? "flex-end" : "flex-start",
        gap: 4,
        color: active ? "var(--fg-1)" : "var(--fg-5)"
      }}
    >
      <span>{label}</span>
      {active && <Icon name={sortDir === "asc" ? "chevron-up" : "chevron-down"} size={11} />}
    </button>
  );
}
