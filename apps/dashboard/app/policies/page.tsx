import { AppShell } from "@/components/shell/AppShell";
import { PoliciesTable } from "@/components/policies/PoliciesTable";
import { getPolicies } from "@/lib/api";

export default async function PoliciesPage() {
  const policies = await getPolicies();
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
          Policies <span style={{ color: "var(--fg-3)", fontWeight: 400 }}>· {policies.length}</span>
        </h1>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--fg-4)" }}>
          Rules that gate human approval. Conditions over typed commitment fields — flag, block, or route.
        </div>
      </div>
      <PoliciesTable initial={policies} />
    </AppShell>
  );
}
