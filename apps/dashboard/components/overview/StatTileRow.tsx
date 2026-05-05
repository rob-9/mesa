import type { OverviewData } from "@/lib/types";
import { StatTile } from "./StatTile";

export function StatTileRow({ stats }: { stats: OverviewData["stats"] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      <StatTile icon="briefcase" value={stats.activeDeliberations} label="Active deliberations" />
      <StatTile icon="agent" value={stats.deployedAgents} label="Deployed agents" />
      <StatTile icon="clock" value={stats.avgTimeToSignoff} label="Avg time to signoff" />
      <StatTile icon="alert" value={stats.awaitingAction} label="Awaiting action" accent />
    </div>
  );
}
