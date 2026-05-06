import { Card } from "@/components/overview/Card";
import { TypeLabel } from "@/components/primitives/TypeLabel";
import type { AgentDetail } from "@/lib/types";

export function AgentConfigCard({ agent }: { agent: AgentDetail }) {
  const { config } = agent;
  return (
    <Card title="Configuration" eyebrow="MODEL · CAPABILITIES">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 11,
              padding: "3px 10px",
              borderRadius: "var(--r-pill)",
              background: "var(--surface-2)",
              color: "var(--fg-1)"
            }}
          >
            {config.model}
          </span>
          <span
            className="mono"
            style={{ fontSize: 11, color: "var(--fg-4)", textAlign: "right" }}
          >
            {config.owner}
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--fg-2)",
            fontStyle: "italic",
            lineHeight: 1.5
          }}
        >
          {config.persona}
        </div>
        <div>
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--fg-5)",
              letterSpacing: "0.06em",
              marginBottom: 6
            }}
          >
            CAPABILITIES
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {config.capabilities.map((t) => (
              <span
                key={t}
                style={{
                  padding: "2px 8px",
                  background: "var(--surface-2)",
                  borderRadius: "var(--r-pill)"
                }}
              >
                <TypeLabel type={t} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
