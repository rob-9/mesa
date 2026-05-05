import { AppShell } from "@/components/shell/AppShell";
import { ComingSoon } from "@/components/shell/ComingSoon";

export default function AuditPage() {
  return (
    <AppShell>
      <ComingSoon title="Audit log" icon="scroll">
        Append-only event log. Every transcript turn, commitment, and signoff with cryptographic provenance.
      </ComingSoon>
    </AppShell>
  );
}
