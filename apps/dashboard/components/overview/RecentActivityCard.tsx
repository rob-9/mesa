import Link from "next/link";
import { TypeLabel } from "@/components/primitives/TypeLabel";
import { formatRelative } from "@/lib/format";
import type { RecentActivity } from "@/lib/types";
import { Card } from "./Card";

export function RecentActivityCard({ items }: { items: RecentActivity[] }) {
  return (
    <Card title="Recent activity" eyebrow={`${items.length} COMMITMENTS`} noPadBody>
      <div>
        {items.map((item, i) => (
          <Link
            key={item.id}
            href={`/deliberations/${item.deliberationId}`}
            className="row-link"
            style={{
              display: "grid",
              gridTemplateColumns: "110px minmax(0, 1fr) 56px",
              gap: 12,
              alignItems: "center",
              padding: "10px 16px",
              borderBottom: i === items.length - 1 ? "none" : "1px solid var(--border-row)",
              textDecoration: "none"
            }}
          >
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <TypeLabel type={item.commitmentType} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--fg-1)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {item.summary}
              </div>
              <div style={{ marginTop: 2, fontSize: 11, color: "var(--fg-5)" }}>
                <span className="mono">{item.deliberationTitle}</span>
                <span style={{ margin: "0 6px" }}>·</span>
                <span>{item.counterparty}</span>
              </div>
            </div>
            <span
              className="mono"
              style={{ fontSize: 11, color: "var(--fg-4)", textAlign: "right" }}
            >
              {formatRelative(item.timestamp)}
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
