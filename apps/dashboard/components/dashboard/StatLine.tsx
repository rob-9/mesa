import type { DashboardData } from "@/lib/types";

export function StatLine({ counts }: { counts: DashboardData["counts"] }) {
  return (
    <div
      className="mono"
      style={{
        marginTop: 6,
        fontSize: 13,
        color: "var(--fg-4)",
        letterSpacing: "0.01em"
      }}
    >
      <Stat n={counts.active} label="active" />
      <Sep />
      <Stat n={counts.awaitingAction} label="awaiting action" tone="accent" />
      <Sep />
      <Stat n={counts.signed24h} label="signed 24h" />
      <Sep />
      <Stat n={counts.flagged} label="flagged" tone="amber" />
    </div>
  );
}

function Sep() {
  return <span style={{ color: "var(--fg-6)", margin: "0 10px" }}>·</span>;
}

function Stat({
  n,
  label,
  tone
}: {
  n: number;
  label: string;
  tone?: "accent" | "amber";
}) {
  const num =
    tone === "accent"
      ? "var(--accent)"
      : tone === "amber"
      ? "var(--amber)"
      : "var(--fg-1)";
  return (
    <span>
      <span style={{ color: num, fontWeight: 500 }}>{n}</span>
      <span style={{ marginLeft: 6 }}>{label}</span>
    </span>
  );
}
