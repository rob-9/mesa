import { Icon } from "@/components/icons/Icon";
import type { IntegrationStatus } from "@/lib/types";

export function ConnectivityCard({ integrations }: { integrations: IntegrationStatus[] }) {
  const sorted = [...integrations].sort((a, b) => {
    if (a.connected === b.connected) return 0;
    return a.connected ? 1 : -1;
  });
  const connected = integrations.filter((i) => i.connected).length;
  const total = integrations.length;
  const ratio = total === 0 ? 0 : connected / total;
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        overflow: "hidden",
        flexShrink: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--surface-2)",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
          <span
            className="mono"
            style={{ fontSize: 10, color: "var(--fg-5)", letterSpacing: "0.06em" }}
          >
            CONNECTIVITY
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-1)", marginTop: 2 }}>
            <span className="mono">{connected}</span>
            <span style={{ color: "var(--fg-4)" }}> of {total} connected</span>
          </span>
        </div>
        <div
          aria-hidden
          style={{
            flex: 1,
            height: 4,
            borderRadius: "var(--r-pill)",
            background: "var(--surface-2)",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${Math.round(ratio * 100)}%`,
              height: "100%",
              background:
                ratio === 1 ? "var(--accent)" : "var(--amber)",
              transition: "width 200ms ease"
            }}
          />
        </div>
      </div>
      <div>
        {sorted.map((int, i) => {
          const isLast = i === sorted.length - 1;
          return (
            <div
              key={int.id}
              style={{
                display: "grid",
                gridTemplateColumns: "auto minmax(0, 1fr) auto",
                gap: 12,
                alignItems: "center",
                padding: "8px 16px",
                borderBottom: isLast ? "none" : "1px solid var(--border-row)"
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "var(--r-pill)",
                  background: int.connected ? "var(--accent)" : "var(--amber)",
                  boxShadow: int.connected
                    ? "0 0 0 3px var(--accent-soft)"
                    : "0 0 0 3px var(--amber-soft)"
                }}
              />
              <div style={{ minWidth: 0, display: "flex", alignItems: "baseline", gap: 8 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: int.connected ? "var(--fg-1)" : "var(--fg-2)",
                    flexShrink: 0
                  }}
                >
                  {int.name}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--fg-5)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {int.description}
                </span>
              </div>
              {int.connected ? (
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: "var(--fg-5)",
                    letterSpacing: "0.06em"
                  }}
                >
                  CONNECTED
                </span>
              ) : (
                <button
                  type="button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 10px",
                    borderRadius: "var(--r-pill)",
                    background: "var(--accent-soft)",
                    border: "1px solid transparent",
                    color: "var(--accent)",
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: "pointer"
                  }}
                >
                  <Icon name="plus" size={10} /> Reconnect
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
