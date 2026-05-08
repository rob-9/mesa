"use client";

import { useMemo, useState } from "react";
import { Pill } from "@/components/primitives/Pill";
import { Icon } from "@/components/icons/Icon";
import { formatRelative } from "@/lib/format";
import type { AuditEvent, AuditEventKind } from "@/lib/types";

const GRID = "92px 130px minmax(0, 1.4fr) minmax(0, 2fr) 60px 28px";

const kindLabel: Record<AuditEventKind, string> = {
  transcript_turn: "transcript",
  commitment_signed: "commitment",
  policy_fired: "policy",
  agent_deployed: "agent",
  principal_added: "principal"
};

const kindTone: Record<AuditEventKind, Parameters<typeof Pill>[0]["tone"]> = {
  transcript_turn: "soft",
  commitment_signed: "accent",
  policy_fired: "amber",
  agent_deployed: "neutral",
  principal_added: "neutral"
};

export function AuditTable({ events }: { events: AuditEvent[] }) {
  const [kindFilter, setKindFilter] = useState<AuditEventKind | "all">("all");
  const [actorQuery, setActorQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const actors = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.actor));
    return Array.from(set).sort();
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (kindFilter !== "all" && e.kind !== kindFilter) return false;
      if (actorQuery && !e.actor.toLowerCase().includes(actorQuery.toLowerCase())) return false;
      return true;
    });
  }, [events, kindFilter, actorQuery]);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <div
        role="search"
        aria-label="Filter audit events"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
          flexWrap: "wrap"
        }}
      >
        <Icon name="filter" size={12} />
        <select
          aria-label="Filter by event kind"
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value as AuditEventKind | "all")}
          style={selectStyle}
        >
          <option value="all">all kinds</option>
          {(Object.keys(kindLabel) as AuditEventKind[]).map((k) => (
            <option key={k} value={k}>{kindLabel[k]}</option>
          ))}
        </select>
        <input
          aria-label="Filter by actor"
          value={actorQuery}
          onChange={(e) => setActorQuery(e.target.value)}
          placeholder="filter actor…"
          list="audit-actors"
          style={{ ...selectStyle, width: 220 }}
        />
        <datalist id="audit-actors">
          {actors.map((a) => <option key={a} value={a} />)}
        </datalist>
        <span aria-live="polite" style={{ marginLeft: "auto", fontSize: 11, color: "var(--fg-5)" }}>
          {filtered.length} of {events.length} events
        </span>
      </div>

      <div
        style={{
          background: "var(--surface-0)",
          border: "1px solid var(--surface-2)",
          borderRadius: "var(--r-card)",
          overflow: "hidden"
        }}
      >
        <div
          className="mono"
          style={{
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
          <span>WHEN</span>
          <span>KIND</span>
          <span>ACTOR</span>
          <span>SUMMARY</span>
          <span style={{ textAlign: "right" }}>HASH</span>
          <span />
        </div>
        {filtered.map((e, i) => {
          const open = openIds.has(e.id);
          const detailsId = `audit-detail-${e.id}`;
          return (
            <div key={e.id} style={{ borderBottom: i === filtered.length - 1 ? "none" : "1px solid var(--border-row)" }}>
              <button
                type="button"
                onClick={() => toggle(e.id)}
                aria-expanded={open}
                aria-controls={detailsId}
                aria-label={`${open ? "Collapse" : "Expand"} ${kindLabel[e.kind]} event by ${e.actor}`}
                onMouseEnter={(ev) => {
                  if (!open) ev.currentTarget.style.background = "var(--surface-1)";
                }}
                onMouseLeave={(ev) => {
                  if (!open) ev.currentTarget.style.background = "transparent";
                }}
                style={{
                  appearance: "none",
                  width: "100%",
                  background: open ? "var(--surface-1)" : "transparent",
                  border: "none",
                  padding: "12px 20px",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "inherit",
                  transition: "background 100ms"
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: GRID, gap: 14, alignItems: "center", fontSize: 12 }}>
                  <span className="mono" style={{ color: "var(--fg-4)" }}>{formatRelative(e.ts)}</span>
                  <span><Pill tone={kindTone[e.kind]}>{kindLabel[e.kind]}</Pill></span>
                  <span className="mono" style={{ color: "var(--fg-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.actor}
                  </span>
                  <span style={{ color: "var(--fg-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.summary}
                  </span>
                  <span className="mono" style={{ textAlign: "right", color: "var(--fg-5)", fontSize: 11 }}>
                    {e.hash.slice(0, 7)}
                  </span>
                  <span style={{ color: "var(--fg-5)", display: "inline-flex", justifyContent: "flex-end" }}>
                    <Icon name={open ? "chevron-up" : "chevron-down"} size={12} />
                  </span>
                </div>
              </button>
              {open && (
                <div
                  id={detailsId}
                  role="region"
                  aria-label="Event details"
                  style={{
                    padding: "12px 20px 16px",
                    background: "var(--surface-1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10
                  }}
                >
                  <KvRow label="id" value={e.id} mono />
                  <KvRow label="ts" value={new Date(e.ts).toISOString()} mono />
                  <KvRow label="target" value={e.target} mono />
                  <KvRow label="hash" value={e.hash} mono />
                  <KvRow label="prev_hash" value={e.prevHash} mono />
                  {e.payload && (
                    <div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--fg-5)", letterSpacing: "0.06em", marginBottom: 4 }}>
                        PAYLOAD
                      </div>
                      <pre
                        className="mono"
                        style={{
                          margin: 0,
                          padding: 10,
                          background: "var(--surface-0)",
                          border: "1px solid var(--surface-2)",
                          borderRadius: 6,
                          fontSize: 11,
                          color: "var(--fg-2)",
                          overflowX: "auto"
                        }}
                      >
{JSON.stringify(e.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div
            role="status"
            style={{ padding: "32px 20px", textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}
          >
            <div style={{ color: "var(--fg-3)", fontSize: 13 }}>No events match the current filters.</div>
            {(kindFilter !== "all" || actorQuery) && (
              <button
                type="button"
                onClick={() => {
                  setKindFilter("all");
                  setActorQuery("");
                }}
                style={{
                  ...selectStyle,
                  alignSelf: "center",
                  cursor: "pointer",
                  color: "var(--accent)",
                  background: "transparent",
                  borderColor: "var(--surface-2)"
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function KvRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 10, fontSize: 12 }}>
      <span className="mono" style={{ color: "var(--fg-5)", width: 80, flexShrink: 0, fontSize: 11, letterSpacing: "0.04em" }}>
        {label}
      </span>
      <span className={mono ? "mono" : undefined} style={{ color: "var(--fg-1)", overflow: "hidden", textOverflow: "ellipsis" }}>
        {value}
      </span>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  appearance: "none",
  height: 26,
  padding: "0 10px",
  background: "var(--surface-1)",
  border: "1px solid var(--surface-2)",
  borderRadius: "var(--r-pill)",
  color: "var(--fg-1)",
  fontSize: 11,
  fontFamily: "inherit"
};
