import { AppShell } from "@/components/shell/AppShell";
import { ActionStrip } from "@/components/dashboard/ActionStrip";
import { DeliberationsTable } from "@/components/dashboard/DeliberationsTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getDashboard } from "@/lib/api";

export default async function DeliberationsPage() {
  const data = await getDashboard();
  return (
    <AppShell>
      <PageHeader counts={data.counts} />
      <ActionStrip actions={data.actions} />
      <DeliberationsTable deliberations={data.deliberations} />
    </AppShell>
  );
}
