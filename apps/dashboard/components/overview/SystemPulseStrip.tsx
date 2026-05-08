import type { SystemPulse } from "@/lib/types";

export function SystemPulseStrip({ pulse }: { pulse: SystemPulse }) {
  const items = [
    { value: pulse.deployedAgents, label: "agents", tone: "neutral" as const },
    {
      value: `${pulse.integrationsConnected}/${pulse.integrationsTotal}`,
      label: "integrations",
      tone:
        pulse.integrationsConnected === pulse.integrationsTotal
          ? ("neutral" as const)
          : ("amber" as const)
    },
    {
      value: pulse.flagged,
      label: "flagged",
      tone: pulse.flagged > 0 ? ("amber" as const) : ("neutral" as const)
    },
    { value: pulse.policyFires24h, label: "policy fires 24h", tone: "neutral" as const }
  ];
  const healthColor = pulse.health === "healthy" ? "var(--accent)" : "var(--amber)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        padding: "8px 14px",
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        fontSize: 12,
        color: "var(--fg-4)",
        flexShrink: 0
      }}
    >
      {items.map((it, i) => (
        <span key={it.label} style={{ display: "inline-flex", alignItems: "baseline" }}>
          {i > 0 && <span style={{ color: "var(--fg-6)", margin: "0 10px" }}>·</span>}
          <span
            className="mono"
            style={{
              fontWeight: 500,
              color: it.tone === "amber" ? "var(--amber)" : "var(--fg-1)"
            }}
          >
            {it.value}
          </span>
          <span style={{ marginLeft: 5 }}>{it.label}</span>
        </span>
      ))}
      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 7 }}>
        <span
          aria-hidden
          style={{
            width: 7,
            height: 7,
            borderRadius: "var(--r-pill)",
            background: healthColor
          }}
        />
        <span style={{ color: "var(--fg-3)", fontSize: 11 }}>
          {pulse.health === "healthy" ? "all systems normal" : "degraded"}
        </span>
      </span>
    </div>
  );
}
