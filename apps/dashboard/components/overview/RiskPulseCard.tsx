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
        padding: "12px 18px",
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}
    >
      <div
        className="mono"
        style={{ fontSize: 10, color: "var(--fg-5)", letterSpacing: "0.06em" }}
      >
        RISK PULSE
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 18,
          alignItems: "end",
          flex: 1
        }}
      >
        {items.map((it) => (
          <Link
            key={it.label}
            href={it.href}
            style={{ textDecoration: "none", display: "block", minWidth: 0 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                minWidth: 0
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  color: it.tone === "amber" ? "var(--amber)" : "var(--fg-1)"
                }}
              >
                {it.value}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--fg-4)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {it.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
