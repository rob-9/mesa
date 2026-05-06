import { TypeLabel } from "@/components/primitives/TypeLabel";
import { formatRelative } from "@/lib/format";
import type { AgentActivityItem, AgentReasoning } from "@/lib/types";

export function AgentReasoningCard({
  reasoning,
  activity
}: {
  reasoning: AgentReasoning[];
  activity: AgentActivityItem[];
}) {
  if (reasoning.length === 0) {
    return (
      <div style={{ padding: 16, fontSize: 12, color: "var(--fg-5)", lineHeight: 1.55 }}>
        No reasoning recorded yet. As this agent emits commitments, the context it pulled, the rule it
        applied, and the rationale for each decision will appear here.
      </div>
    );
  }
  const byId = new Map(activity.map((a) => [a.id, a]));
  return (
    <div>
      {reasoning.map((r, i) => {
        const item = byId.get(r.activityId);
        const isLast = i === reasoning.length - 1;
        return (
          <div
            key={r.activityId}
            style={{
              padding: "14px 16px",
              borderBottom: isLast ? "none" : "1px solid var(--border-row)",
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}
          >
            {/* commitment header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "110px minmax(0, 1fr) 56px",
                gap: 12,
                alignItems: "center"
              }}
            >
              <span style={{ minWidth: 0 }}>
                {item ? <TypeLabel type={item.commitmentType} /> : <span className="mono" style={{ fontSize: 11, color: "var(--fg-5)" }}>—</span>}
              </span>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--fg-1)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {item?.summary ?? "(commitment not found)"}
              </div>
              <span
                className="mono"
                style={{ fontSize: 11, color: "var(--fg-4)", textAlign: "right" }}
              >
                {item ? formatRelative(item.timestamp) : ""}
              </span>
            </div>

            {/* context pulled */}
            <ReasoningSection label="CONTEXT PULLED">
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                {r.contextPulled.map((c, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: 12,
                      color: "var(--fg-2)",
                      lineHeight: 1.5,
                      paddingLeft: 14,
                      position: "relative"
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: 4,
                        top: 8,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        background: "var(--accent)",
                        opacity: 0.6
                      }}
                    />
                    {c}
                  </li>
                ))}
              </ul>
            </ReasoningSection>

            {/* rule applied */}
            <ReasoningSection label="RULE APPLIED">
              <div
                className="mono"
                style={{
                  fontSize: 12,
                  color: "var(--fg-2)",
                  lineHeight: 1.5,
                  padding: "6px 10px",
                  background: "var(--surface-2)",
                  borderRadius: 6
                }}
              >
                {r.ruleApplied}
              </div>
            </ReasoningSection>

            {/* decision */}
            <ReasoningSection label="DECISION">
              <div style={{ fontSize: 12, color: "var(--fg-1)", lineHeight: 1.55 }}>
                {r.decision}
              </div>
            </ReasoningSection>
          </div>
        );
      })}
    </div>
  );
}

function ReasoningSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        className="mono"
        style={{
          fontSize: 10,
          color: "var(--fg-5)",
          letterSpacing: "0.06em"
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
