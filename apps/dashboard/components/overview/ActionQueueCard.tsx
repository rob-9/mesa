import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { TypeLabel } from "@/components/primitives/TypeLabel";
import { formatRelative } from "@/lib/format";
import type { Action } from "@/lib/types";
import { Card } from "./Card";

export function ActionQueueCard({ actions, total }: { actions: Action[]; total: number }) {
  const top = actions.slice(0, 3);
  return (
    <Card
      title="Action queue"
      eyebrow={`${total} WAITING`}
      trailing={
        <Link
          href="/deliberations"
          style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent)" }}
        >
          View all <Icon name="chevron-right" size={12} />
        </Link>
      }
      noPadBody
    >
      <div>
        {top.map((action, i) => (
          <Link
            key={action.id}
            href={`/deliberations/${action.deliberationId}`}
            className="row-link"
            style={{
              display: "block",
              padding: "8px 16px",
              borderBottom: i === top.length - 1 ? "none" : "1px solid var(--border-row)",
              textDecoration: "none"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <TypeLabel type={action.commitment.type} />
              <span className="mono" style={{ fontSize: 11, color: "var(--fg-4)" }}>
                {formatRelative(action.commitment.createdAt)}
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--fg-2)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {action.counterparty}
              {action.kind === "agent_pending" && action.agent && (
                <>
                  <span style={{ color: "var(--fg-6)", margin: "0 6px" }}>·</span>
                  <span style={{ color: "var(--accent)" }}>{action.agent}</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
