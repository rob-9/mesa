import { Icon } from "@/components/icons/Icon";

export function SearchBar({ placeholder = "Search" }: { placeholder?: string }) {
  return (
    <div
      style={{
        flex: 1,
        maxWidth: 460,
        display: "flex",
        alignItems: "center",
        gap: 9,
        height: 32,
        padding: "0 14px",
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-pill)",
        color: "var(--fg-4)",
        minWidth: 0
      }}
    >
      <Icon name="search" size={13} />
      <span style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{placeholder}</span>
    </div>
  );
}
