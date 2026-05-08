import { ActionsTable } from "@/components/dashboard/ActionsTable";
import { DeliberationsTable } from "@/components/dashboard/DeliberationsTable";
import { MostRecentCards } from "@/components/dashboard/MostRecentCards";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AppShell } from "@/components/shell/AppShell";
import { getDashboard } from "@/lib/api";

export default async function DeliberationsPage() {
  const data = await getDashboard();
  const recentCount = Math.min(3, data.deliberations.length);
  return (
    <AppShell>
      <PageHeader counts={data.counts} />

      {recentCount > 0 && (
        <>
          <SectionLabel
            title={`Most recent · ${recentCount}`}
            subtitle="Latest activity across your deliberations."
          />
          <MostRecentCards deliberations={data.deliberations} />
        </>
      )}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: data.actions.length > 0 ? "minmax(0, 1fr) minmax(0, 1fr)" : "1fr",
          gap: 18
        }}
      >
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <SectionLabel
            title={`Active deliberations · ${data.deliberations.length}`}
            subtitle="Click any row to open."
          />
          <DeliberationsTable deliberations={data.deliberations} />
        </div>
        {data.actions.length > 0 && (
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <SectionLabel
              title={`Actions awaiting · ${data.actions.length}`}
              subtitle="Commitments blocked on a human or agent."
            />
            <ActionsTable actions={data.actions} />
          </div>
        )}
      </div>
    </AppShell>
  );
}

function SectionLabel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--fg-1)",
          letterSpacing: "-0.005em"
        }}
      >
        {title}
      </span>
      <span style={{ fontSize: 12, color: "var(--fg-5)" }}>{subtitle}</span>
    </div>
  );
}
