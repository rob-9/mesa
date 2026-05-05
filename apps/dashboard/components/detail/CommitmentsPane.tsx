import type { Commitment } from "@/lib/types";
import { CommitmentCard } from "./CommitmentCard";
import { CommitmentGraph } from "./CommitmentGraph";

type ViewMode = "list" | "graph";

interface CommitmentsPaneProps {
  commitments: Commitment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
}

export function CommitmentsPane({
  commitments,
  selectedId,
  onSelect,
  viewMode,
  onChangeViewMode
}: CommitmentsPaneProps) {
  return (
    <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div
        style={{
          padding: "10px 18px",
          borderBottom: "1px solid var(--surface-2)",
          position: "sticky",
          top: 0,
          background: "var(--surface-0)",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--fg-5)",
            letterSpacing: "0.08em"
          }}
        >
          COMMITMENTS · {commitments.length}
        </span>
        <ViewToggle mode={viewMode} onChange={onChangeViewMode} />
      </div>
      {viewMode === "list" ? (
        <div style={{ padding: "14px 18px" }}>
          {commitments.length === 0 && (
            <div style={{ color: "var(--fg-4)", fontSize: 13 }}>No commitments extracted yet.</div>
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
      ) : (
        <CommitmentGraph commitments={commitments} selectedId={selectedId} onSelect={onSelect} />
      )}
    </div>
  );
}

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-pill)",
        padding: 2
      }}
    >
      {(["list", "graph"] as const).map((m) => {
        const active = m === mode;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            style={{
              padding: "3px 11px",
              borderRadius: "var(--r-pill)",
              background: active ? "var(--surface-2)" : "transparent",
              color: active ? "var(--fg-0)" : "var(--fg-4)",
              fontSize: 11,
              textTransform: "capitalize"
            }}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}
