import { AppShell } from "@/components/shell/AppShell";
import { ActionQueueCard } from "@/components/overview/ActionQueueCard";
import { AgentStatusStrip } from "@/components/overview/AgentStatusStrip";
import { IntegrationsCard } from "@/components/overview/IntegrationsCard";
import { RecentActivityCard } from "@/components/overview/RecentActivityCard";
import { StatTileRow } from "@/components/overview/StatTileRow";
import { getOverview } from "@/lib/api";

export default async function OverviewPage() {
  const data = await getOverview();
  return (
    <AppShell>
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 30,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            fontWeight: 600,
            color: "var(--fg-0)"
          }}
        >
          Overview <span style={{ color: "var(--fg-3)", fontWeight: 400 }}>· acme corp</span>
        </h1>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--fg-4)" }}>
          What your agents have been doing today.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <StatTileRow stats={data.stats} />
        <AgentStatusStrip agents={data.agents} />
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
          <RecentActivityCard items={data.recent} />
          <ActionQueueCard actions={data.actions} total={data.totalActions} />
          <IntegrationsCard integrations={data.integrations} />
        </div>
      </div>
    </AppShell>
  );
}
