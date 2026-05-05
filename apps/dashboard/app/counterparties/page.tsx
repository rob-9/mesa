import { AppShell } from "@/components/shell/AppShell";
import { ComingSoon } from "@/components/shell/ComingSoon";

export default function CounterpartiesPage() {
  return (
    <AppShell>
      <ComingSoon title="Counterparties" icon="building">
        Every organization you've deliberated with — historical deal volume, active threads, and shared schemas.
      </ComingSoon>
    </AppShell>
  );
}
