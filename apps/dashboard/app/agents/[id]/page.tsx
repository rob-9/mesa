import { notFound } from "next/navigation";
import { AgentHeader } from "@/components/agents/AgentHeader";
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
        {/* Left column: Activity (large), Config (medium) — added in later tasks */}
        {/* Right column: Connections, Policies — added in later tasks */}
      </div>
    </AppShell>
  );
}
