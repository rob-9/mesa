import { Icon } from "@/components/icons/Icon";
import type { IntegrationStatus } from "@/lib/types";
import { Card } from "./Card";

export function IntegrationsCard({ integrations }: { integrations: IntegrationStatus[] }) {
  const connected = integrations.filter((i) => i.connected).length;
  return (
    <Card title="Integrations" eyebrow={`${connected} OF ${integrations.length} CONNECTED`} noPadBody>
      <div>
        {integrations.map((int, i) => (
          <div
            key={int.id}
            style={{
              display: "grid",
              gridTemplateColumns: "20px minmax(0, 1fr) auto",
              gap: 12,
              alignItems: "center",
              padding: "12px 20px",
              borderBottom: i === integrations.length - 1 ? "none" : "1px solid var(--border-row)"
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "var(--r-pill)",
                background: int.connected ? "var(--accent-soft)" : "var(--surface-2)",
                color: int.connected ? "var(--accent)" : "var(--fg-5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Icon name={int.connected ? "check" : "x"} size={12} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "var(--fg-1)", fontWeight: 500 }}>{int.name}</div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--fg-5)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {int.description}
              </div>
            </div>
            <span style={{ fontSize: 11, color: int.connected ? "var(--fg-5)" : "var(--accent)" }}>
              {int.connected ? "Connected" : "Connect →"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
