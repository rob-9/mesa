import type { CommitmentType } from "@/lib/types";

interface TypeLabelProps {
  type: CommitmentType;
  selected?: boolean;
}

export function TypeLabel({ type, selected = false }: TypeLabelProps) {
  return (
    <span
      className="mono"
      style={{
        fontSize: 11,
        letterSpacing: "0.02em",
        color: selected ? "var(--accent)" : "var(--fg-3)",
        fontWeight: selected ? 500 : 400
      }}
    >
      {type}
    </span>
  );
}
