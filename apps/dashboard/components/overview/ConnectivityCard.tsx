import { Icon } from "@/components/icons/Icon";
import type { IntegrationStatus } from "@/lib/types";

export function ConnectivityCard({ integrations }: { integrations: IntegrationStatus[] }) {
  const sorted = [...integrations].sort((a, b) => {
    if (a.connected === b.connected) return 0;
    return a.connected ? 1 : -1; // disconnected first
  });
  const connected = integrations.filter((i) => i.connected).length;
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        padding: "10px 16px",
        flexShrink: 0,
        minWidth: 0
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8
        }}
      >
        <span
          className="mono"
          style={{ fontSize: 10, color: "var(--fg-5)", letterSpacing: "0.06em" }}
        >
          CONNECTIVITY
        </span>
        <span style={{ fontSize: 11, color: "var(--fg-4)" }}>
          {connected} of {integrations.length} connected
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {sorted.map((int) => (
          <span
            key={int.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px 4px 8px",
              borderRadius: "var(--r-pill)",
              background: int.connected ? "var(--surface-2)" : "transparent",
              border: int.connected
                ? "1px solid var(--surface-3)"
                : "1px dashed var(--surface-3)",
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
                background: int.connected ? "var(--accent)" : "var(--amber)"
              }}
            />
            {int.name}
            {!int.connected && (
              <span
                style={{
                  color: "var(--accent)",
                  marginLeft: 2,
                  display: "inline-flex",
                  alignItems: "center"
                }}
              >
                <Icon name="plus" size={10} />
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
