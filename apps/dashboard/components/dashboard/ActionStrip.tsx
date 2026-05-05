import type { Action } from "@/lib/types";

export function ActionStrip({ actions }: { actions: Action[] }) {
  if (actions.length === 0) return null;

  // Inline preview of up to 3 actions (type · counterparty).
  const previews = actions.slice(0, 3).map((a, i) => (
    <span key={a.id}>
      {i > 0 && <span style={{ color: "var(--fg-6)", margin: "0 8px" }}>·</span>}
      <span className="mono" style={{ color: "var(--fg-2)" }}>{a.commitment.type}</span>
      <span style={{ color: "var(--fg-5)", margin: "0 6px" }}>·</span>
      <span style={{ color: "var(--fg-4)" }}>{a.counterparty}</span>
    </span>
  ));
  const more = actions.length > 3 ? ` · +${actions.length - 3} more` : "";

  return (
    <div
      style={{
        background: "linear-gradient(90deg, var(--accent-strong-bg) 0%, var(--surface-2) 110%)",
        border: "1px solid var(--accent-strong-border)",
        borderRadius: "var(--r-card)",
        padding: "14px 18px",
        marginBottom: 18,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "var(--r-inner)",
            background: "var(--accent-soft)",
            color: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600
          }}
        >
          {actions.length}
        </div>
        <div>
          <div style={{ color: "var(--fg-1)", fontSize: 13, fontWeight: 500 }}>
            {actions.length} action{actions.length === 1 ? "" : "s"} waiting
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-4)", marginTop: 2 }}>
            {previews}
            {more && <span style={{ color: "var(--fg-5)" }}>{more}</span>}
          </div>
        </div>
      </div>
      <button
        style={{
          padding: "8px 14px",
          borderRadius: "var(--r-pill)",
          background: "var(--surface-2)",
          color: "var(--accent)",
          fontSize: 12
        }}
      >
        Review →
      </button>
    </div>
  );
}
