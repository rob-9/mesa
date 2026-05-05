import type { Stage } from "@/lib/types";

const stages: Stage[] = ["offer", "scope", "amendment", "signoff"];

interface ProgressDotsProps {
  stage: Stage;
  flagged: boolean;
}

export function ProgressDots({ stage, flagged }: ProgressDotsProps) {
  const reachedIdx = stages.indexOf(stage);
  const accentColor = flagged ? "var(--amber)" : "var(--accent)";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "inline-flex", gap: 4 }}>
        {stages.map((s, i) => {
          const reached = i <= reachedIdx;
          const isCurrent = i === reachedIdx;
          return (
            <span
              key={s}
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "var(--r-pill)",
                background: reached ? accentColor : "var(--surface-3)",
                opacity: reached && !isCurrent ? 0.55 : 1
              }}
            />
          );
        })}
      </div>
      <span
        className="mono"
        style={{
          fontSize: 11,
          color: flagged ? "var(--amber)" : "var(--fg-2)"
        }}
      >
        {flagged ? "flagged" : stage}
      </span>
    </div>
  );
}
