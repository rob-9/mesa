import Link from "next/link";
import type { RiskPulse } from "@/lib/types";

export function RiskPulseCard({ risk }: { risk: RiskPulse }) {
  const items = [
    {
      value: risk.flaggedOpen,
      label: "flagged open",
      href: "/deliberations?flagged=1",
      tone: risk.flaggedOpen > 0 ? "amber" : "neutral"
    },
    {
      value: risk.policyFires24h,
      label: "policy fires · 24h",
      href: "/policies",
      tone: "neutral" as const
    },
    {
      value: risk.staleOver7d,
      label: "stale > 7d",
      href: "/deliberations?stale=1",
      tone: risk.staleOver7d > 0 ? "amber" : "neutral"
    }
  ];
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        padding: "10px 16px",
        flexShrink: 0
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 10,
          color: "var(--fg-5)",
          letterSpacing: "0.06em",
          marginBottom: 8
        }}
      >
        RISK PULSE
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {items.map((it) => (
          <Link
            key={it.label}
            href={it.href}
            style={{ textDecoration: "none", display: "block", minWidth: 0 }}
          >
            <span
              className="mono"
              style={{
                display: "block",
                fontSize: 22,
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                color: it.tone === "amber" ? "var(--amber)" : "var(--fg-1)"
              }}
            >
              {it.value}
            </span>
            <span style={{ fontSize: 11, color: "var(--fg-4)", marginTop: 2, display: "block" }}>
              {it.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
