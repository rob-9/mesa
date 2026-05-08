import Link from "next/link";
import { Icon } from "@/components/icons/Icon";

export interface LabStats {
  activeDeliberations: number;
  awaitingAction: number;
  medianAge: string;
  autoResolved: string;
  flagged: number;
  deployedAgents: number;
}

type Tone = "accent" | "amber" | "muted";

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
  const bg = tone === "accent" ? "var(--accent-strong-bg)" : "var(--surface-1)";
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

export function SupportingLine({ stats }: { stats: LabStats }) {
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
