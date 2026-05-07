import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { CounterpartyHeader } from "@/components/counterparties/CounterpartyHeader";
import { CounterpartyTabsContent } from "@/components/counterparties/CounterpartyTabsContent";
import { getCounterparty, getDashboard, getDeliberation } from "@/lib/api";
import type { Commitment } from "@/lib/types";

function formatYearMonth(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en", { month: "short", year: "numeric" });
}

export default async function CounterpartyDetailPage({ params }: { params: { slug: string } }) {
  const counterparty = await getCounterparty(params.slug);
  if (!counterparty) notFound();

  const dash = await getDashboard();
  const deliberations = dash.deliberations.filter((d) => d.counterparty === params.slug);

  const commitmentRows: { commitment: Commitment; deliberationId: string; deliberationTitle: string }[] = [];
  for (const d of deliberations) {
    const detail = await getDeliberation(d.id);
    if (!detail) continue;
    for (const c of detail.commitments) {
      commitmentRows.push({ commitment: c, deliberationId: d.id, deliberationTitle: d.title });
    }
  }
  commitmentRows.sort((a, b) => Date.parse(b.commitment.createdAt) - Date.parse(a.commitment.createdAt));

  return (
    <AppShell>
      <CounterpartyHeader counterparty={counterparty} />
      <CounterpartyTabsContent
        counterparty={counterparty}
        deliberations={deliberations}
        commitments={commitmentRows}
        firstDeliberationLabel={formatYearMonth(counterparty.firstDeliberationAt)}
      />
    </AppShell>
  );
}
