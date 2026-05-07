import { TrustBadge } from "./TrustBadge";
import type { Counterparty } from "@/lib/types";

export function CounterpartyHeader({ counterparty }: { counterparty: Counterparty }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            letterSpacing: "-0.015em",
            lineHeight: 1.15,
            fontWeight: 600,
            color: "var(--fg-0)"
          }}
        >
          {counterparty.name}
        </h1>
        <TrustBadge tier={counterparty.trustTier} />
        <span className="mono" style={{ color: "var(--fg-5)", fontSize: 12 }}>{counterparty.domain}</span>
      </div>
      {counterparty.notes && (
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--fg-4)", maxWidth: 720 }}>
          {counterparty.notes}
        </div>
      )}
    </div>
  );
}
