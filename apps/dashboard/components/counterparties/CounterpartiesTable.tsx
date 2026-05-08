import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { TrustBadge } from "./TrustBadge";
import { formatRelative } from "@/lib/format";
import type { Counterparty } from "@/lib/types";
import type { CounterpartyRollup } from "@/lib/counterparty-fixtures";

const GRID = "minmax(0, 1.6fr) 110px 110px 130px 90px 24px";

export function CounterpartiesTable({
  counterparties,
  rollups
}: {
  counterparties: Counterparty[];
  rollups: Record<string, CounterpartyRollup>;
}) {
  return (
    <div
      style={{
        background: "var(--surface-0)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        overflow: "hidden"
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
        <span>NAME</span>
        <span>TRUST</span>
        <span style={{ textAlign: "right" }}>ACTIVE DEALS</span>
        <span style={{ textAlign: "right" }}>COMMITMENTS</span>
        <span style={{ textAlign: "right" }}>LAST</span>
        <span />
      </div>
      <div>
        {counterparties.length === 0 && (
          <div
            style={{
              padding: "32px 20px",
              textAlign: "center",
              color: "var(--fg-5)",
              fontSize: 12
            }}
          >
            No counterparties yet — start a deliberation to see them here.
          </div>
        )}
        {counterparties.map((c, i) => {
          const r = rollups[c.slug];
          return (
            <Link
              key={c.slug}
              href={`/counterparties/${c.slug}`}
              className="row-link"
              style={{
                display: "block",
                padding: "12px 20px",
                borderBottom: i === counterparties.length - 1 ? "none" : "1px solid var(--border-row)",
                textDecoration: "none",
                color: "inherit"
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID,
                  gap: 14,
                  alignItems: "center",
                  fontSize: 13
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span style={{ color: "var(--fg-0)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.name}
                  </span>
                  <span className="mono" style={{ color: "var(--fg-5)", fontSize: 11 }}>{c.domain}</span>
                </div>
                <span><TrustBadge tier={c.trustTier} /></span>
                <span className="mono" style={{ textAlign: "right", color: r?.activeDeals ? "var(--fg-1)" : "var(--fg-5)" }}>
                  {r?.activeDeals ?? 0}
                </span>
                <span className="mono" style={{ textAlign: "right", color: "var(--fg-2)" }}>
                  {r?.totalCommitments ?? 0}
                </span>
                <span className="mono" style={{ textAlign: "right", color: "var(--fg-4)", fontSize: 12 }}>
                  {r?.lastActivity ? formatRelative(r.lastActivity) : "—"}
                </span>
                <span style={{ color: "var(--fg-5)", display: "inline-flex", justifyContent: "flex-end" }}>
                  <Icon name="chevron-right" size={13} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
