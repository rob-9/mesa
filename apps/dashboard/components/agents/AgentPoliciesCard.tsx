import type { AgentPolicy } from "@/lib/types";

export function AgentPoliciesCard({ policies }: { policies: AgentPolicy[] }) {
  return (
    <div>
      {policies.map((p, i) => (
        <div
          key={p.id}
          style={{
            padding: "10px 16px",
            borderBottom: i === policies.length - 1 ? "none" : "1px solid var(--border-row)"
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: 12,
              alignItems: "baseline"
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "var(--fg-1)",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {p.label}
            </span>
            <span
              className="mono"
              style={{ fontSize: 12, color: "var(--fg-2)", textAlign: "right" }}
            >
              {p.value}
            </span>
          </div>
          {p.rationale ? (
            <div
              style={{
                fontSize: 11,
                color: "var(--fg-5)",
                marginTop: 2,
                lineHeight: 1.5
              }}
            >
              {p.rationale}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
