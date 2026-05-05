import type { Deliberation } from "@/lib/types";
import { DeliberationRow } from "./DeliberationRow";

const GRID =
  "minmax(0, 1.6fr) 130px 110px 150px 70px 70px";

export function DeliberationsTable({ deliberations }: { deliberations: Deliberation[] }) {
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
        <span>DELIBERATION</span>
        <span>COUNTERPARTY</span>
        <span>STAGE</span>
        <span>WAITING ON</span>
        <span style={{ textAlign: "right" }}>COMMITS</span>
        <span style={{ textAlign: "right" }}>LAST</span>
      </div>
      {deliberations.map((d, i) => (
        <DeliberationRow
          key={d.id}
          deliberation={d}
          isLast={i === deliberations.length - 1}
          gridTemplate={GRID}
        />
      ))}
    </div>
  );
}
