import Link from "next/link";
import { Pill } from "@/components/primitives/Pill";
import { StagePill } from "@/components/primitives/StagePill";
import type { Deliberation } from "@/lib/types";

export function DetailHeader({ deliberation }: { deliberation: Deliberation }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 22
      }}
    >
      <div className="mono" style={{ fontSize: 13, color: "var(--fg-4)" }}>
        <Link href="/deliberations" style={{ color: "var(--fg-2)" }}>
          deliberations
        </Link>
        <span style={{ color: "var(--fg-6)", margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--fg-0)" }}>{deliberation.title}</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Pill tone="neutral">{deliberation.counterparty}</Pill>
        <StagePill stage={deliberation.stage} flagged={deliberation.flagged} />
      </div>
    </div>
  );
}
