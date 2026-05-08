import { AppShell } from "@/components/shell/AppShell";
import { AgentFleetCard } from "@/components/overview/AgentFleetCard";
import { ConnectivityCard } from "@/components/overview/ConnectivityCard";
import { FleetNavbar } from "@/components/overview/FleetNavbar";
import { RiskPulseCard } from "@/components/overview/RiskPulseCard";
import { SignificantEventsCard } from "@/components/overview/SignificantEventsCard";
import { getOverview } from "@/lib/api";

export default async function OverviewPage() {
  const data = await getOverview();
  const events = data.events;
  const risk = data.risk;

  return (
    <AppShell>
      <div style={{ marginBottom: 12, flexShrink: 0 }}>
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
          Overview
        </h1>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--fg-4)" }}>
          Operational health across your agents, integrations, and policies.
        </div>
      </div>

      <div
        style={{
          marginBottom: 10,
          flexShrink: 0,
          display: "flex",
          gap: 10,
          alignItems: "stretch"
        }}
      >
        <FleetNavbar agents={data.agents} />
        <RiskPulseCard risk={risk} />
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
          gap: 10
        }}
      >
        <div style={{ minHeight: 0, display: "flex", flexDirection: "column" }}>
          <AgentFleetCard agents={data.agents} />
        </div>
        <div
          style={{
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}
        >
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <SignificantEventsCard events={events} />
          </div>
          <ConnectivityCard integrations={data.integrations} />
        </div>
      </div>
    </AppShell>
  );
}
