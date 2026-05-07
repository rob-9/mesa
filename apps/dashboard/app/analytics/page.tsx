import { AppShell } from "@/components/shell/AppShell";
import { AnalyticsCards } from "@/components/analytics/AnalyticsCards";
import { getAnalytics } from "@/lib/api";

export default async function AnalyticsPage() {
  const data = await getAnalytics();
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
          Analytics
        </h1>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--fg-4)" }}>
          Throughput, auto-resolution rate, time-to-resolution, and policy activity over the last 14 days.
        </div>
      </div>
      <AnalyticsCards data={data} />
    </AppShell>
  );
}
