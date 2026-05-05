import { AppShell } from "@/components/shell/AppShell";
import { ComingSoon } from "@/components/shell/ComingSoon";

export default function PoliciesPage() {
  return (
    <AppShell>
      <ComingSoon title="Policies" icon="scales">
        Rules that gate human approval. Write conditions over typed commitment fields — flag, block, or auto-route to the right reviewer.
      </ComingSoon>
    </AppShell>
  );
}
