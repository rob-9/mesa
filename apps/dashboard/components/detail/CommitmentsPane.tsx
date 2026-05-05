import type { Commitment } from "@/lib/types";
import { CommitmentCard } from "./CommitmentCard";

interface CommitmentsPaneProps {
  commitments: Commitment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CommitmentsPane({ commitments, selectedId, onSelect }: CommitmentsPaneProps) {
  return (
    <div style={{ overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <div
        className="mono"
        style={{
          padding: "12px 22px",
          borderBottom: "1px solid var(--surface-2)",
          fontSize: 11,
          color: "var(--fg-5)",
          letterSpacing: "0.08em",
          position: "sticky",
          top: 0,
          background: "var(--surface-0)",
          zIndex: 1
        }}
      >
        COMMITMENTS · {commitments.length}
      </div>
      <div style={{ padding: "16px 22px" }}>
        {commitments.length === 0 && (
          <div style={{ color: "var(--fg-4)", fontSize: 13 }}>
            No commitments extracted yet.
          </div>
        )}
        {commitments.map((c) => (
          <CommitmentCard
            key={c.id}
            commitment={c}
            selected={c.id === selectedId}
            onSelect={() => onSelect(c.id)}
          />
        ))}
      </div>
    </div>
  );
}
