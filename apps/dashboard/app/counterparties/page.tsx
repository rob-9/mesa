import { AppShell } from "@/components/shell/AppShell";
import { CounterpartiesTable } from "@/components/counterparties/CounterpartiesTable";
import { getCounterparties, getCounterpartyRollups } from "@/lib/api";

export default async function CounterpartiesPage() {
  const [counterparties, rollups] = await Promise.all([
    getCounterparties(),
    getCounterpartyRollups()
  ]);
  return (
    <AppShell>
      <div style={{ marginBottom: 18 }}>
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
          Counterparties{" "}
          <span style={{ color: "var(--fg-3)", fontWeight: 400 }}>· {counterparties.length}</span>
        </h1>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--fg-4)" }}>
          Organizations you've deliberated with — historical deal volume, active threads, and shared schemas.
        </div>
      </div>
      <CounterpartiesTable counterparties={counterparties} rollups={rollups} />
    </AppShell>
  );
}
