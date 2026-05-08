"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { Pill } from "@/components/primitives/Pill";
import { formatRelative } from "@/lib/format";
import type {
  AgentStatus,
  IntegrationStatus,
  SignificantEvent
} from "@/lib/types";
import type { KpiFilter, StateFilter } from "./OverviewFilterStrip";

type Tab = "all" | "agents" | "events" | "integrations";

interface ActivityTableProps {
  agents: AgentStatus[];
  events: SignificantEvent[];
  integrations: IntegrationStatus[];
  globalQuery: string;
  stateFilter: StateFilter;
  kpiFilter: KpiFilter;
}

const tdBase: CSSProperties = {
  padding: "10px 14px",
  fontSize: 12,
  color: "var(--fg-1)",
  verticalAlign: "middle"
};

const thBase: CSSProperties = {
  padding: "8px 14px",
  fontSize: 10,
  fontWeight: 500,
  color: "var(--fg-5)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  textAlign: "left",
  background: "var(--surface-1)",
  borderBottom: "1px solid var(--surface-2)",
  position: "sticky",
  top: 0,
  zIndex: 1
};

const stateMeta: Record<
  AgentStatus["state"],
  { label: string; tone: Parameters<typeof Pill>[0]["tone"] }
> = {
  blocked: { label: "blocked", tone: "amber" },
  negotiating: { label: "negotiating", tone: "accent" },
  idle: { label: "idle", tone: "neutral" }
};

const eventLabel: Record<SignificantEvent["kind"], string> = {
  deliberation_signed: "signed",
  policy_fired: "policy",
  agent_deployed: "deployed",
  integration_disconnected: "offline",
  principal_added: "principal"
};

function matchesQuery(haystack: string, q: string): boolean {
  if (!q) return true;
  return haystack.toLowerCase().includes(q.toLowerCase());
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function ActivityTable({
  agents,
  events,
  integrations,
  globalQuery,
  stateFilter,
  kpiFilter
}: ActivityTableProps) {
  const [tab, setTab] = useState<Tab>("all");
  const [tableQuery, setTableQuery] = useState("");
  const q = (globalQuery + " " + tableQuery).trim();

  const filtered = useMemo(() => {
    const now = Date.now();
    const sevenDayCutoff = now - SEVEN_DAYS_MS;
    const dayCutoff = now - TWENTY_FOUR_HOURS_MS;

    let a = agents;
    if (stateFilter !== "all") a = a.filter((x) => x.state === stateFilter);
    if (kpiFilter === "flagged") a = a.filter((x) => x.state === "blocked");
    if (kpiFilter === "stale")
      a = a.filter((x) => new Date(x.lastActivity).getTime() < sevenDayCutoff);
    a = a.filter((x) =>
      matchesQuery(`${x.name} ${x.role} ${x.deliberationTitle ?? ""}`, q)
    );

    let e = events;
    if (kpiFilter === "flagged") e = e.filter((x) => x.kind === "policy_fired");
    if (kpiFilter === "policy24h")
      e = e.filter(
        (x) =>
          x.kind === "policy_fired" &&
          new Date(x.timestamp).getTime() > dayCutoff
      );
    e = e.filter((x) => matchesQuery(x.summary, q));

    let ints = integrations;
    ints = ints.filter((x) => matchesQuery(`${x.name} ${x.description}`, q));

    return { agents: a, events: e, integrations: ints };
  }, [agents, events, integrations, stateFilter, kpiFilter, q]);

  const counts = {
    all: filtered.agents.length + filtered.events.length + filtered.integrations.length,
    agents: filtered.agents.length,
    events: filtered.events.length,
    integrations: filtered.integrations.length
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--surface-2)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0 }}>
          {(["all", "agents", "events", "integrations"] as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  border: "none",
                  background: active ? "var(--surface-2)" : "transparent",
                  color: active ? "var(--fg-0)" : "var(--fg-3)",
                  padding: "6px 12px",
                  borderRadius: "var(--r-pill)",
                  fontSize: 12,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  textTransform: "capitalize",
                  fontFamily: "inherit"
                }}
              >
                {t}
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: active ? "var(--fg-3)" : "var(--fg-5)"
                  }}
                >
                  {counts[t]}
                </span>
              </button>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--surface-0)",
            border: "1px solid var(--surface-2)",
            borderRadius: "var(--r-pill)",
            padding: "5px 10px",
            minWidth: 200
          }}
        >
          <svg
            width={12}
            height={12}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            style={{ color: "var(--fg-5)" }}
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={tableQuery}
            onChange={(e) => setTableQuery(e.target.value)}
            placeholder="Filter..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--fg-1)",
              fontSize: 12
            }}
          />
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "none" }}>
        {tab === "all" && <AllTab data={filtered} />}
        {tab === "agents" && <AgentsTab agents={filtered.agents} />}
        {tab === "events" && <EventsTab events={filtered.events} />}
        {tab === "integrations" && <IntegrationsTab integrations={filtered.integrations} />}
      </div>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "32px 14px",
        textAlign: "center",
        fontSize: 12,
        color: "var(--fg-5)"
      }}
    >
      {message}
    </div>
  );
}

function AgentsTab({ agents }: { agents: AgentStatus[] }) {
  if (!agents.length) return <EmptyRow message="No agents match these filters." />;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thBase}>Agent</th>
          <th style={thBase}>Role</th>
          <th style={thBase}>Deliberation</th>
          <th style={thBase}>State</th>
          <th style={{ ...thBase, textAlign: "right" }}>Last activity</th>
        </tr>
      </thead>
      <tbody>
        {agents.map((a, i) => (
          <tr
            key={a.id}
            style={{
              borderBottom:
                i === agents.length - 1 ? "none" : "1px solid var(--border-row)"
            }}
          >
            <td style={tdBase}>
              <Link
                href={`/agents/${a.id}`}
                className="mono"
                style={{ color: "var(--fg-1)", textDecoration: "none", fontWeight: 500 }}
              >
                {a.name}
              </Link>
            </td>
            <td style={{ ...tdBase, color: "var(--fg-3)" }}>{a.role}</td>
            <td style={{ ...tdBase, color: "var(--fg-2)" }}>
              {a.deliberationId && a.deliberationTitle ? (
                <Link
                  href={`/deliberations/${a.deliberationId}`}
                  style={{ color: "var(--fg-1)", textDecoration: "none" }}
                >
                  {a.deliberationTitle}
                </Link>
              ) : (
                <span style={{ color: "var(--fg-5)" }}>—</span>
              )}
            </td>
            <td style={tdBase}>
              <Pill tone={stateMeta[a.state].tone}>{stateMeta[a.state].label}</Pill>
            </td>
            <td
              style={{ ...tdBase, textAlign: "right", color: "var(--fg-4)" }}
              className="mono"
            >
              {formatRelative(a.lastActivity)} ago
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EventsTab({ events }: { events: SignificantEvent[] }) {
  if (!events.length) return <EmptyRow message="No events match these filters." />;
  const sorted = [...events].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thBase}>Kind</th>
          <th style={thBase}>Summary</th>
          <th style={{ ...thBase, textAlign: "right" }}>Time</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((e, i) => (
          <tr
            key={e.id}
            style={{
              borderBottom:
                i === sorted.length - 1 ? "none" : "1px solid var(--border-row)"
            }}
          >
            <td style={tdBase}>
              <Pill tone="soft">{eventLabel[e.kind]}</Pill>
            </td>
            <td style={{ ...tdBase, color: "var(--fg-1)" }}>
              {e.href ? (
                <Link href={e.href} style={{ color: "var(--fg-1)", textDecoration: "none" }}>
                  {e.summary}
                </Link>
              ) : (
                e.summary
              )}
            </td>
            <td
              style={{ ...tdBase, textAlign: "right", color: "var(--fg-4)" }}
              className="mono"
            >
              {formatRelative(e.timestamp)} ago
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IntegrationsTab({ integrations }: { integrations: IntegrationStatus[] }) {
  if (!integrations.length)
    return <EmptyRow message="No integrations match these filters." />;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thBase}>Integration</th>
          <th style={thBase}>Description</th>
          <th style={{ ...thBase, textAlign: "right" }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {integrations.map((it, i) => (
          <tr
            key={it.id}
            style={{
              borderBottom:
                i === integrations.length - 1
                  ? "none"
                  : "1px solid var(--border-row)"
            }}
          >
            <td style={{ ...tdBase, fontWeight: 500 }}>{it.name}</td>
            <td style={{ ...tdBase, color: "var(--fg-3)" }}>{it.description}</td>
            <td style={{ ...tdBase, textAlign: "right" }}>
              <Pill tone={it.connected ? "accent" : "amber"}>
                {it.connected ? "connected" : "disconnected"}
              </Pill>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type UnifiedRow =
  | { kind: "agent"; ts: number; data: AgentStatus }
  | { kind: "event"; ts: number; data: SignificantEvent }
  | { kind: "integration"; ts: number; data: IntegrationStatus };

function AllTab({
  data
}: {
  data: { agents: AgentStatus[]; events: SignificantEvent[]; integrations: IntegrationStatus[] };
}) {
  const rows: UnifiedRow[] = [
    ...data.agents.map<UnifiedRow>((a) => ({
      kind: "agent",
      ts: new Date(a.lastActivity).getTime(),
      data: a
    })),
    ...data.events.map<UnifiedRow>((e) => ({
      kind: "event",
      ts: new Date(e.timestamp).getTime(),
      data: e
    })),
    ...data.integrations.map<UnifiedRow>((i) => ({
      kind: "integration",
      ts: 0,
      data: i
    }))
  ].sort((a, b) => b.ts - a.ts);

  if (!rows.length) return <EmptyRow message="Nothing to show." />;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thBase}>Type</th>
          <th style={thBase}>Subject</th>
          <th style={thBase}>Meta</th>
          <th style={{ ...thBase, textAlign: "right" }}>Time</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const last = i === rows.length - 1;
          const border = last ? "none" : "1px solid var(--border-row)";
          if (row.kind === "agent") {
            const a = row.data;
            return (
              <tr key={`agent-${a.id}`} style={{ borderBottom: border }}>
                <td style={tdBase}>
                  <Pill tone="soft">agent</Pill>
                </td>
                <td style={tdBase}>
                  <Link
                    href={`/agents/${a.id}`}
                    className="mono"
                    style={{ color: "var(--fg-1)", textDecoration: "none", fontWeight: 500 }}
                  >
                    {a.name}
                  </Link>
                  <span style={{ color: "var(--fg-4)", marginLeft: 8 }}>{a.role}</span>
                </td>
                <td style={{ ...tdBase, color: "var(--fg-3)" }}>
                  {a.deliberationTitle ?? "—"}
                </td>
                <td
                  style={{ ...tdBase, textAlign: "right", color: "var(--fg-4)" }}
                  className="mono"
                >
                  {formatRelative(a.lastActivity)} ago
                </td>
              </tr>
            );
          }
          if (row.kind === "event") {
            const e = row.data;
            return (
              <tr key={`event-${e.id}`} style={{ borderBottom: border }}>
                <td style={tdBase}>
                  <Pill tone="soft">{eventLabel[e.kind]}</Pill>
                </td>
                <td style={{ ...tdBase, color: "var(--fg-1)" }}>
                  {e.href ? (
                    <Link
                      href={e.href}
                      style={{ color: "var(--fg-1)", textDecoration: "none" }}
                    >
                      {e.summary}
                    </Link>
                  ) : (
                    e.summary
                  )}
                </td>
                <td style={{ ...tdBase, color: "var(--fg-4)" }}>—</td>
                <td
                  style={{ ...tdBase, textAlign: "right", color: "var(--fg-4)" }}
                  className="mono"
                >
                  {formatRelative(e.timestamp)} ago
                </td>
              </tr>
            );
          }
          const it = row.data;
          return (
            <tr key={`int-${it.id}`} style={{ borderBottom: border }}>
              <td style={tdBase}>
                <Pill tone="soft">integration</Pill>
              </td>
              <td style={{ ...tdBase, fontWeight: 500 }}>{it.name}</td>
              <td style={{ ...tdBase, color: "var(--fg-3)" }}>{it.description}</td>
              <td style={{ ...tdBase, textAlign: "right" }}>
                <Pill tone={it.connected ? "accent" : "amber"}>
                  {it.connected ? "connected" : "disconnected"}
                </Pill>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
