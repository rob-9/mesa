import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { AppShell } from "@/components/shell/AppShell";
import { OverviewHero } from "@/components/overview/OverviewHero";
import { getOverview } from "@/lib/api";
import type { OverviewData } from "@/lib/types";

type Stats = OverviewData["stats"];

export default async function LabPage() {
  const data = await getOverview();
  const s = data.stats;

  return (
    <AppShell>
      <div style={{ marginBottom: 18 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            letterSpacing: "-0.015em",
            lineHeight: 1.15,
            fontWeight: 600,
            color: "var(--fg-0)"
          }}
        >
          Lab <span style={{ color: "var(--fg-3)", fontWeight: 400 }}>· stat strip options</span>
        </h1>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--fg-4)" }}>
          Same data, six layouts. Pick one (or mix).
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <Variant label="A · Hero + supporting line" note="Awaiting is the headline; rest reads as a sentence.">
          <HeroLayout stats={s} />
        </Variant>

        <Variant label="B · 2 × 3 grid" note="Equal weight, more breathing room than a single row.">
          <GridLayout stats={s} />
        </Variant>

        <Variant label="C · Inline (no card)" note="Pure text below the page title — disappears into the page.">
          <InlineLayout stats={s} />
        </Variant>

        <Variant label="D · Grouped strip" note="Pipeline | Performance, with a visible group separator.">
          <GroupedLayout stats={s} />
        </Variant>

        <Variant
          label="E · Two-up: hero pair (now live on /)"
          note="Two equal hero tiles (Awaiting + Flagged), tiny supporting line under."
        >
          <OverviewHero stats={s} />
        </Variant>

        <Variant label="F · Compact strip" note="Six stats in one slim row — too dense to read comfortably.">
          <CompactLayout stats={s} />
        </Variant>
      </div>
    </AppShell>
  );
}

// ─── frame ─────────────────────────────────────────────────────────────────

function Variant({ label, note, children }: { label: string; note: string; children: ReactNode }) {
  return (
    <section>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
        <span
          className="mono"
          style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.06em" }}
        >
          {label.toUpperCase()}
        </span>
        <span style={{ fontSize: 12, color: "var(--fg-5)" }}>{note}</span>
      </div>
      {children}
    </section>
  );
}

// ─── A · hero + supporting line ────────────────────────────────────────────

function HeroLayout({ stats }: { stats: Stats }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          alignItems: "center",
          gap: 16,
          padding: "18px 22px",
          background: "var(--accent-strong-bg)",
          border: "1px solid var(--accent-strong-border)",
          borderRadius: "var(--r-card)"
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, minWidth: 0 }}>
          <span
            className="mono"
            style={{
              fontSize: 44,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              lineHeight: 1,
              color: "var(--accent)"
            }}
          >
            {stats.awaitingAction}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--fg-0)" }}>
              awaiting action
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-4)", marginTop: 2 }}>
              commitments need a decision from a human or internal agent
            </div>
          </div>
        </div>
        <Link
          href="/deliberations"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: "var(--accent)",
            color: "var(--bg)",
            borderRadius: "var(--r-pill)",
            fontSize: 12,
            fontWeight: 500
          }}
        >
          Review queue <Icon name="chevron-right" size={12} />
        </Link>
      </div>
      <ThinLine stats={stats} excludeAwaiting />
    </div>
  );
}

// ─── B · 2×3 grid ──────────────────────────────────────────────────────────

function GridLayout({ stats }: { stats: Stats }) {
  const cells: { value: string | number; label: string; tone?: "accent" | "amber" }[] = [
    { value: stats.activeDeliberations, label: "active deliberations" },
    {
      value: stats.awaitingAction,
      label: "awaiting action",
      tone: stats.awaitingAction > 0 ? "accent" : undefined
    },
    { value: stats.medianAge, label: "median age" },
    { value: stats.autoResolved, label: "auto-resolved" },
    {
      value: stats.flagged,
      label: "flagged",
      tone: stats.flagged > 0 ? "amber" : undefined
    },
    { value: stats.deployedAgents, label: "deployed agents" }
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 10
      }}
    >
      {cells.map((c) => {
        const valueColor =
          c.tone === "accent" ? "var(--accent)" : c.tone === "amber" ? "var(--amber)" : "var(--fg-0)";
        return (
          <div
            key={c.label}
            style={{
              padding: "16px 18px",
              background: "var(--surface-1)",
              border: "1px solid var(--surface-2)",
              borderRadius: "var(--r-card)"
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                color: valueColor
              }}
            >
              {c.value}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--fg-4)" }}>{c.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── C · inline (no card) ──────────────────────────────────────────────────

function InlineLayout({ stats }: { stats: Stats }) {
  return (
    <div
      style={{
        padding: "10px 0 14px",
        borderTop: "1px solid var(--surface-2)",
        borderBottom: "1px solid var(--surface-2)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: "0 4px",
        fontSize: 14,
        color: "var(--fg-3)"
      }}
    >
      <InlineStat value={stats.activeDeliberations} label="active" />
      <InlineSep />
      <InlineStat value={stats.awaitingAction} label="awaiting" tone="accent" />
      <InlineSep />
      <InlineStat value={stats.medianAge} label="median age" />
      <InlineSep />
      <InlineStat value={stats.autoResolved} label="auto-resolved" />
      <InlineSep />
      <InlineStat value={stats.flagged} label="flagged" tone={stats.flagged > 0 ? "amber" : undefined} />
      <InlineSep />
      <InlineStat value={stats.deployedAgents} label="agents" />
    </div>
  );
}

function InlineStat({
  value,
  label,
  tone
}: {
  value: string | number;
  label: string;
  tone?: "accent" | "amber";
}) {
  const valueColor =
    tone === "accent" ? "var(--accent)" : tone === "amber" ? "var(--amber)" : "var(--fg-0)";
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 5 }}>
      <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: valueColor }}>
        {value}
      </span>
      <span style={{ fontSize: 12, color: "var(--fg-4)" }}>{label}</span>
    </span>
  );
}

function InlineSep() {
  return <span style={{ color: "var(--fg-6)", margin: "0 8px" }}>·</span>;
}

// ─── D · grouped strip ─────────────────────────────────────────────────────

function GroupedLayout({ stats }: { stats: Stats }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)",
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        overflow: "hidden"
      }}
    >
      <Group label="PIPELINE">
        <GroupCell value={stats.activeDeliberations} label="active" />
        <GroupCell
          value={stats.awaitingAction}
          label="awaiting"
          tone={stats.awaitingAction > 0 ? "accent" : undefined}
        />
        <GroupCell value={stats.medianAge} label="median age" />
      </Group>
      <div style={{ background: "var(--surface-2)" }} />
      <Group label="PERFORMANCE">
        <GroupCell value={stats.autoResolved} label="auto-resolved" />
        <GroupCell
          value={stats.flagged}
          label="flagged"
          tone={stats.flagged > 0 ? "amber" : undefined}
        />
        <GroupCell value={stats.deployedAgents} label="agents" />
      </Group>
    </div>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ padding: "12px 16px 14px", minWidth: 0 }}>
      <div
        className="mono"
        style={{ fontSize: 10, color: "var(--fg-5)", letterSpacing: "0.08em", marginBottom: 10 }}
      >
        {label}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function GroupCell({
  value,
  label,
  tone
}: {
  value: string | number;
  label: string;
  tone?: "accent" | "amber";
}) {
  const valueColor =
    tone === "accent" ? "var(--accent)" : tone === "amber" ? "var(--amber)" : "var(--fg-0)";
  return (
    <div style={{ minWidth: 0 }}>
      <div
        className="mono"
        style={{
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
          color: valueColor
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: "var(--fg-5)" }}>{label}</div>
    </div>
  );
}

// ─── F · compact strip (kept as a foil for the chosen design) ──────────────

function CompactLayout({ stats }: { stats: Stats }) {
  const entries: { value: string | number; label: string; tone?: "accent" | "amber" }[] = [
    { value: stats.activeDeliberations, label: "active" },
    {
      value: stats.awaitingAction,
      label: "awaiting",
      tone: stats.awaitingAction > 0 ? "accent" : undefined
    },
    { value: stats.medianAge, label: "median age" },
    { value: stats.autoResolved, label: "auto-resolved" },
    { value: stats.flagged, label: "flagged", tone: stats.flagged > 0 ? "amber" : undefined },
    { value: stats.deployedAgents, label: "agents" }
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${entries.length}, minmax(0, 1fr))`,
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        overflow: "hidden"
      }}
    >
      {entries.map((e, i) => {
        const valueColor =
          e.tone === "accent" ? "var(--accent)" : e.tone === "amber" ? "var(--amber)" : "var(--fg-0)";
        return (
          <div
            key={e.label}
            style={{
              padding: "14px 18px",
              borderRight: i === entries.length - 1 ? "none" : "1px solid var(--surface-2)",
              minWidth: 0
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                color: valueColor
              }}
            >
              {e.value}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 11,
                color: "var(--fg-5)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {e.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── shared by variant A ───────────────────────────────────────────────────

function ThinLine({
  stats,
  excludeAwaiting = false
}: {
  stats: Stats;
  excludeAwaiting?: boolean;
}) {
  const items: { value: string | number; label: string; tone?: "amber" }[] = [
    { value: stats.activeDeliberations, label: "active" },
    ...(excludeAwaiting ? [] : [{ value: stats.awaitingAction, label: "awaiting" }]),
    { value: stats.medianAge, label: "median age" },
    { value: stats.autoResolved, label: "auto-resolved" },
    {
      value: stats.flagged,
      label: "flagged",
      tone: (stats.flagged > 0 ? "amber" : undefined) as "amber" | undefined
    },
    { value: stats.deployedAgents, label: "agents" }
  ];
  return (
    <div
      style={{
        padding: "8px 16px",
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        fontSize: 12,
        color: "var(--fg-4)"
      }}
    >
      {items.map((it, i) => (
        <span key={it.label} style={{ display: "inline-flex", alignItems: "baseline" }}>
          {i > 0 && <span style={{ color: "var(--fg-6)", margin: "0 10px" }}>·</span>}
          <span
            className="mono"
            style={{ color: it.tone === "amber" ? "var(--amber)" : "var(--fg-1)", fontWeight: 500 }}
          >
            {it.value}
          </span>
          <span style={{ marginLeft: 5 }}>{it.label}</span>
        </span>
      ))}
    </div>
  );
}
