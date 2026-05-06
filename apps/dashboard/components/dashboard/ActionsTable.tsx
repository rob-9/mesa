import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { TypeLabel } from "@/components/primitives/TypeLabel";
import { formatRelative } from "@/lib/format";
import type { Action } from "@/lib/types";

const GRID = "120px minmax(0, 1.6fr) 130px 130px 60px 110px";

function blockedLabel(action: Action): { text: string; color: string } {
  if (action.kind === "human_signoff") {
    return { text: "human signoff", color: "var(--accent)" };
  }
  return { text: action.agent ?? "agent", color: "var(--fg-2)" };
}

export function ActionsTable({ actions }: { actions: Action[] }) {
  if (actions.length === 0) return null;
  return (
    <div
      style={{
        background: "var(--surface-0)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        overflow: "hidden",
        marginBottom: 24,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        maxHeight: 260
      }}
    >
      <div
        className="mono"
        style={{
          flexShrink: 0,
          display: "grid",
          gridTemplateColumns: GRID,
          gap: 14,
          padding: "12px 20px",
          fontSize: 11,
          color: "var(--fg-5)",
          letterSpacing: "0.06em",
          borderBottom: "1px solid var(--surface-2)"
        }}
      >
        <span>TYPE</span>
        <span>DELIBERATION</span>
        <span>COUNTERPARTY</span>
        <span>BLOCKED ON</span>
        <span style={{ textAlign: "right" }}>AGE</span>
        <span style={{ textAlign: "right" }}>DECIDE</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "none", minHeight: 0 }}>
        {actions.map((action, i) => {
          const blocked = blockedLabel(action);
          const isLast = i === actions.length - 1;
          return (
            <div
              key={action.id}
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                gap: 14,
                padding: "12px 18px",
                alignItems: "center",
                borderBottom: isLast ? "none" : "1px solid var(--border-row)",
                fontSize: 13
              }}
            >
              <TypeLabel type={action.commitment.type} />
              <Link
                href={`/deliberations/${action.deliberationId}`}
                style={{
                  color: "var(--fg-0)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {action.deliberationTitle}
              </Link>
              <span style={{ color: "var(--fg-3)" }}>{action.counterparty}</span>
              <span className="mono" style={{ fontSize: 12, color: blocked.color }}>
                {blocked.text}
              </span>
              <span
                className="mono"
                style={{ textAlign: "right", color: "var(--fg-4)", fontSize: 12 }}
              >
                {formatRelative(action.commitment.createdAt)}
              </span>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button
                  aria-label="Approve"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "var(--r-pill)",
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Icon name="check" size={14} />
                </button>
                <button
                  aria-label="Reject"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "var(--r-pill)",
                    background: "var(--surface-2)",
                    color: "var(--fg-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
