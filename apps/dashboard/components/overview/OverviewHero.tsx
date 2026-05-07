import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import type { OverviewData } from "@/lib/types";

type Stats = OverviewData["stats"];
type Tone = "accent" | "amber" | "muted";

// Two-up hero pair (Awaiting action + Flagged) over a thin supporting line of
// the remaining stats. Monotone — no gradients.
export function OverviewHero({ stats }: { stats: Stats }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <HeroTile
          value={stats.awaitingAction}
          title="awaiting action"
          subtitle="needs you or an internal agent"
          tone={stats.awaitingAction > 0 ? "accent" : "muted"}
          href="/deliberations"
          ctaLabel="Review"
        />
        <HeroTile
          value={stats.flagged}
          title="flagged"
          subtitle={stats.flagged === 0 ? "no policy issues right now" : "policy violations open"}
          tone={stats.flagged > 0 ? "amber" : "muted"}
          href="/deliberations"
          ctaLabel="Inspect"
        />
      </div>
      <SupportingLine stats={stats} />
    </div>
  );
}

// Exported for re-use inside /lab.
export function HeroTile({
  value,
  title,
  subtitle,
  tone,
  href,
  ctaLabel
}: {
  value: number;
  title: string;
  subtitle: string;
  tone: Tone;
  href: string;
  ctaLabel: string;
}) {
  const valueColor =
    tone === "accent" ? "var(--accent)" : tone === "amber" ? "var(--amber)" : "var(--fg-3)";
  const bg =
    tone === "accent" ? "var(--accent-strong-bg)" : "var(--surface-1)";
  const border =
    tone === "accent" ? "1px solid var(--accent-strong-border)" : "1px solid var(--surface-2)";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        background: bg,
        border,
        borderRadius: "var(--r-card)"
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0 }}>
        <span
          className="mono"
          style={{
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            lineHeight: 1,
            color: valueColor
          }}
        >
          {value}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-0)" }}>{title}</div>
          <div style={{ fontSize: 11, color: "var(--fg-5)", marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>
      <Link
        href={href}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "5px 11px",
          borderRadius: "var(--r-pill)",
          background: tone === "muted" ? "transparent" : "var(--surface-2)",
          border: tone === "muted" ? "1px solid var(--surface-2)" : "1px solid transparent",
          color:
            tone === "amber"
              ? "var(--amber)"
              : tone === "accent"
              ? "var(--accent)"
              : "var(--fg-3)",
          fontSize: 11
        }}
      >
        {ctaLabel} <Icon name="chevron-right" size={11} />
      </Link>
    </div>
  );
}

// Exported for re-use inside /lab.
export function SupportingLine({ stats }: { stats: Stats }) {
  const items = [
    { value: stats.activeDeliberations, label: "active" },
    { value: stats.medianAge, label: "median age" },
    { value: stats.autoResolved, label: "auto-resolved" },
    { value: stats.deployedAgents, label: "agents" }
  ];
  return (
    <div
      style={{
        padding: "6px 14px",
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
          <span className="mono" style={{ color: "var(--fg-1)", fontWeight: 500 }}>
            {it.value}
          </span>
          <span style={{ marginLeft: 5 }}>{it.label}</span>
        </span>
      ))}
    </div>
  );
}
