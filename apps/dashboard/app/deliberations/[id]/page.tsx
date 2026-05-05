import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { SplitView } from "@/components/detail/SplitView";
import { getDeliberation } from "@/lib/api";

export default async function DeliberationDetailPage({
  params
}: {
  params: { id: string };
}) {
  const detail = await getDeliberation(params.id);
  if (!detail) notFound();
  return (
    <AppShell>
      <DetailHeader deliberation={detail.deliberation} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <SplitView turns={detail.turns} commitments={detail.commitments} />
      </div>
    </AppShell>
  );
}
