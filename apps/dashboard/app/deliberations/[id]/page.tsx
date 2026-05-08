import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { SplitView } from "@/components/detail/SplitView";
import { getDeliberation } from "@/lib/api";

export default async function DeliberationDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { live?: string };
}) {
  const detail = await getDeliberation(params.id);
  if (!detail) notFound();
  const live = searchParams?.live === "1";
  return (
    <AppShell>
      <DetailHeader deliberation={detail.deliberation} />
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <SplitView
          turns={detail.turns}
          commitments={detail.commitments}
          hitlGate={detail.hitlGate}
          postSignoffTasks={detail.postSignoffTasks}
          live={live}
        />
      </div>
    </AppShell>
  );
}
