import { notFound } from "next/navigation";
import { AgentConfigCard } from "@/components/agents/AgentConfigCard";
import { AgentConnectionsCard } from "@/components/agents/AgentConnectionsCard";
import { AgentHeader } from "@/components/agents/AgentHeader";
import { AgentPoliciesCard } from "@/components/agents/AgentPoliciesCard";
import { AppShell } from "@/components/shell/AppShell";
import { getAgent } from "@/lib/api";

export default async function AgentDetailPage({
  params
}: {
  params: { id: string };
}) {
  const agent = await getAgent(params.id);
  if (!agent) notFound();
  return (
    <AppShell>
      <AgentHeader agent={agent} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: 12,
          marginTop: 18
        }}
      >
        {/* left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* activity card slotted in a later task */}
          <AgentConfigCard agent={agent} />
        </div>
        {/* right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <AgentConnectionsCard connections={agent.connections} />
          <AgentPoliciesCard policies={agent.policies} />
        </div>
      </div>
    </AppShell>
  );
}
