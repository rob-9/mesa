import { Icon } from "@/components/icons/Icon";

export function SearchBar({ placeholder = "Search deliberations, counterparties, commitments…" }: { placeholder?: string }) {
  return (
    <div
      style={{
        flex: 1,
        maxWidth: 480,
        display: "flex",
        alignItems: "center",
        gap: 10,
        height: 36,
        padding: "0 14px",
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-pill)",
        color: "var(--fg-4)"
      }}
    >
      <Icon name="search" size={14} />
      <span style={{ fontSize: 13 }}>{placeholder}</span>
    </div>
  );
}
