import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { AgentDetailClient } from "@/components/agents/AgentDetailClient";
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
      <AgentDetailClient initialAgent={agent} />
    </AppShell>
  );
}
