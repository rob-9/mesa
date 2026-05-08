import Link from "next/link";
import { TypeLabel } from "@/components/primitives/TypeLabel";
import { formatRelative } from "@/lib/format";
import type { Action } from "@/lib/types";

const GRID = "90px minmax(0, 1fr) 110px 110px 48px";

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
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0
      }}
    >
      <div style={{ overflowX: "auto", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
       <div style={{ minWidth: 680, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
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
          <span>TITLE</span>
          <span>PARTY</span>
          <span>BLOCKED</span>
          <span style={{ textAlign: "right" }}>AGE</span>
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
            </div>
          );
        })}
        </div>
       </div>
      </div>
    </div>
  );
}
