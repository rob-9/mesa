import type { CSSProperties, ReactNode } from "react";

type Tone = "neutral" | "accent" | "amber" | "soft";

const toneStyles: Record<Tone, CSSProperties> = {
  neutral: {
    background: "var(--surface-2)",
    color: "var(--fg-3)"
  },
  accent: {
    background: "var(--accent-soft)",
    color: "var(--accent)"
  },
  amber: {
    background: "var(--amber-soft)",
    color: "var(--amber)"
  },
  soft: {
    background: "var(--surface-1)",
    color: "var(--fg-4)"
  }
};

interface PillProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Pill({ tone = "neutral", children, className, style }: PillProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "var(--r-pill)",
        fontSize: 11,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        ...toneStyles[tone],
        ...style
      }}
    >
      {children}
    </span>
  );
}
