"use client";

interface OverviewSearchBarProps {
  value: string;
  onChange: (next: string) => void;
}

export function OverviewSearchBar({ value, onChange }: OverviewSearchBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-pill)",
        flexShrink: 0
      }}
    >
      <svg
        width={14}
        height={14}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        style={{ color: "var(--fg-5)", flexShrink: 0 }}
      >
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search agents, deliberations, events..."
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "var(--fg-1)",
          fontSize: 13
        }}
      />
    </div>
  );
}
