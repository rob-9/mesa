import { AppShell } from "@/components/shell/AppShell";
import { ComingSoon } from "@/components/shell/ComingSoon";

export default function AgentsPage() {
  return (
    <AppShell>
      <ComingSoon title="Agents" icon="robot">
        Deploy and configure your internal agents — the buyers, sellers, legal-review bots, and policy gates that negotiate on your behalf.
      </ComingSoon>
    </AppShell>
  );
}
