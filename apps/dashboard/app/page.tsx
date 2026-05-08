import { AppShell } from "@/components/shell/AppShell";
import { OverviewBody } from "@/components/overview/OverviewBody";
import { getOverview } from "@/lib/api";

export default async function OverviewPage() {
  const data = await getOverview();

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
      <OverviewBody data={data} />
    </AppShell>
  );
}
