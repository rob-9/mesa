interface FilterChipsProps {
  active: string;
}

const chips = ["All", "Active", "Awaiting action", "Flagged", "Signed"];

// v1 inert; chips render visual state only.
export function FilterChips({ active }: FilterChipsProps) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
      {chips.map((chip) => {
        const isActive = chip === active;
        return (
          <span
            key={chip}
            style={{
              padding: "5px 12px",
              borderRadius: "var(--r-pill)",
              fontSize: 12,
              background: isActive ? "var(--surface-2)" : "transparent",
              color: isActive ? "var(--fg-1)" : "var(--fg-4)",
              border: isActive ? "1px solid var(--surface-3)" : "1px solid var(--surface-2)",
              cursor: "default"
            }}
          >
            {chip}
          </span>
        );
      })}
    </div>
  );
}
