import { Icon } from "@/components/icons/Icon";
import type { IntegrationStatus } from "@/lib/types";

// Slim horizontal strip — one row of chips. Reclaims the vertical space the
// old card used since "is X connected" is yes/no information.
export function IntegrationsCard({ integrations }: { integrations: IntegrationStatus[] }) {
  const connected = integrations.filter((i) => i.connected).length;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 16px",
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        minWidth: 0
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2, flexShrink: 0 }}>
        <span
          className="mono"
          style={{ fontSize: 10, color: "var(--fg-5)", letterSpacing: "0.06em" }}
        >
          INTEGRATIONS
        </span>
        <span style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 2 }}>
          {connected} of {integrations.length} connected
        </span>
      </div>
      <div
        aria-hidden
        style={{
          width: 1,
          alignSelf: "stretch",
          background: "var(--surface-2)",
          marginLeft: 4,
          marginRight: 4
        }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, minWidth: 0 }}>
        {integrations.map((int) => (
          <span
            key={int.id}
            title={int.description}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px 4px 8px",
              borderRadius: "var(--r-pill)",
              background: int.connected ? "var(--surface-2)" : "transparent",
              border: int.connected ? "1px solid var(--surface-3)" : "1px dashed var(--surface-3)",
              color: int.connected ? "var(--fg-2)" : "var(--fg-5)",
              fontSize: 11,
              whiteSpace: "nowrap"
            }}
          >
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "var(--r-pill)",
                background: int.connected ? "var(--accent)" : "var(--fg-6)"
              }}
            />
            {int.name}
            {!int.connected && (
              <span style={{ color: "var(--accent)", marginLeft: 2, display: "inline-flex", alignItems: "center" }}>
                <Icon name="plus" size={10} />
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
