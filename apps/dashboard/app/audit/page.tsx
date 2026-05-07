import { AppShell } from "@/components/shell/AppShell";
import { AuditTable } from "@/components/audit/AuditTable";
import { Pill } from "@/components/primitives/Pill";
import { getAuditEvents } from "@/lib/api";

export default async function AuditPage() {
  const events = await getAuditEvents();
  return (
    <AppShell>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            Audit log <span style={{ color: "var(--fg-3)", fontWeight: 400 }}>· {events.length}</span>
          </h1>
          <Pill tone="soft">append-only</Pill>
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--fg-4)" }}>
          Every transcript turn, commitment, and signoff with cryptographic provenance. Hash-chained.
        </div>
      </div>
      <AuditTable events={events} />
    </AppShell>
  );
}
