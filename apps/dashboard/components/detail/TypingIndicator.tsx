interface TypingIndicatorProps {
  speaker: string;
}

function isSelf(speaker: string): boolean {
  return speaker === "lab";
}

export function TypingIndicator({ speaker }: TypingIndicatorProps) {
  const right = isSelf(speaker);
  const wrapAlign = right ? "flex-end" : "flex-start";
  const headerOrder = right ? "row-reverse" : "row";
  const radius = right ? "14px 14px 4px 14px" : "14px 14px 14px 4px";
  const bg = right
    ? "linear-gradient(rgba(217, 119, 87, 0.10), rgba(217, 119, 87, 0.10)), var(--surface-2)"
    : "var(--surface-1)";
  const border = right ? "1px solid rgba(217, 119, 87, 0.22)" : "1px solid var(--surface-2)";

  return (
    <div
      className="typing-indicator-in"
      role="status"
      aria-live="polite"
      aria-label={`${speaker} is composing a turn`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: wrapAlign,
        marginBottom: 14
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: headerOrder,
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
          fontSize: 11,
          color: "var(--fg-4)"
        }}
      >
        <span style={{ color: "var(--fg-3)" }}>{speaker}</span>
        <span style={{ color: "var(--fg-5)" }}>·</span>
        <span className="mono" style={{ color: "var(--fg-5)" }}>
          thinking…
        </span>
      </div>
      <div
        style={{
          padding: "10px 14px",
          background: bg,
          border,
          borderRadius: radius,
          display: "inline-flex",
          alignItems: "center",
          gap: 5
        }}
      >
        <span className="typing-dot" />
        <span className="typing-dot" style={{ animationDelay: "0.16s" }} />
        <span className="typing-dot" style={{ animationDelay: "0.32s" }} />
      </div>
    </div>
  );
}
