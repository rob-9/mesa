import { Icon } from "@/components/icons/Icon";
import { SearchBar } from "./SearchBar";

export function TopBar() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "16px 32px",
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
          width: 36,
          height: 36,
          borderRadius: "var(--r-pill)",
          background: "var(--surface-1)",
          color: "var(--fg-3)",
          position: "relative"
        }}
      >
        <Icon name="bell" size={16} />
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 8,
            right: 9,
            width: 7,
            height: 7,
            borderRadius: "var(--r-pill)",
            background: "var(--accent)",
            border: "1.5px solid var(--bg)"
          }}
        />
      </button>
    </header>
  );
}
