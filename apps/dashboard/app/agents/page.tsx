import { AgentsTable } from "@/components/agents/AgentsTable";
import { AppShell } from "@/components/shell/AppShell";
import { getAgents } from "@/lib/api";

export default async function AgentsPage() {
  const agents = await getAgents();
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
          Agents <span style={{ color: "var(--fg-3)", fontWeight: 400 }}>· {agents.length}</span>
        </h1>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--fg-4)" }}>
          Internal agents you have deployed onto the platform.
        </div>
      </div>
      <AgentsTable agents={agents} />
    </AppShell>
  );
}
