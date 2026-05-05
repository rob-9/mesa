import { Icon } from "@/components/icons/Icon";
import { SearchBar } from "./SearchBar";

export function TopBar() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "12px 28px",
        borderBottom: "1px solid var(--surface-2)"
      }}
    >
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <SearchBar />
      </div>
      <button
        aria-label="Notifications"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: "var(--r-pill)",
          background: "var(--surface-1)",
          color: "var(--fg-3)",
          position: "relative",
          flexShrink: 0
        }}
      >
        <Icon name="bell" size={14} />
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 7,
            right: 8,
            width: 6,
            height: 6,
            borderRadius: "var(--r-pill)",
            background: "var(--accent)",
            border: "1.5px solid var(--bg)"
          }}
        />
      </button>
    </header>
  );
}
