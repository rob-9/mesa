import type { AgentConnection } from "@/lib/types";

const KIND_ORDER: AgentConnection["kind"][] = ["data_source", "tool", "messaging", "identity"];
const KIND_LABEL: Record<AgentConnection["kind"], string> = {
  data_source: "DATA SOURCES",
  tool: "TOOLS",
  messaging: "MESSAGING",
  identity: "IDENTITY"
};

const STATUS_COLOR: Record<AgentConnection["status"], string> = {
  connected: "var(--accent)",
  degraded: "var(--amber)",
  disconnected: "var(--fg-5)"
};

function ConnectionRow({ c, isLast }: { c: AgentConnection; isLast: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "8px minmax(0, 1fr) auto",
        gap: 12,
        alignItems: "center",
        padding: "10px 16px",
        borderBottom: isLast ? "none" : "1px solid var(--border-row)"
      }}
    >
      <span
        role="img"
        aria-label={`status: ${c.status}`}
        title={c.status}
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: STATUS_COLOR[c.status]
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--fg-1)",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {c.name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--fg-5)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {c.description}
        </div>
      </div>
      {c.scope ? (
        <span
          className="mono"
          style={{ fontSize: 10, color: "var(--fg-4)", textAlign: "right" }}
        >
          {c.scope}
        </span>
      ) : (
        <span />
      )}
    </div>
  );
}

export function AgentConnectionsCard({ connections }: { connections: AgentConnection[] }) {
  const grouped = KIND_ORDER.map((kind) => ({
    kind,
    items: connections.filter((c) => c.kind === kind)
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      {grouped.map((group, gi) => (
        <div
          key={group.kind}
          style={{
            borderBottom: gi === grouped.length - 1 ? "none" : "1px solid var(--surface-2)"
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--fg-5)",
              letterSpacing: "0.06em",
              padding: "10px 16px 4px"
            }}
          >
            {KIND_LABEL[group.kind]}
          </div>
          {group.items.map((c, i) => (
            <ConnectionRow key={c.id} c={c} isLast={i === group.items.length - 1} />
          ))}
        </div>
      ))}
    </div>
  );
}
