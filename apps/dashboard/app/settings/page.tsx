import { AppShell } from "@/components/shell/AppShell";
import { ComingSoon } from "@/components/shell/ComingSoon";

export default function SettingsPage() {
  return (
    <AppShell>
      <ComingSoon title="Settings" icon="gear">
        Org info, principals and ed25519 keys, vertical-pack schemas, and integrations.
      </ComingSoon>
    </AppShell>
  );
}
