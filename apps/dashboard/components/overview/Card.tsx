import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  eyebrow?: string;
  trailing?: ReactNode;
  children: ReactNode;
  noPadBody?: boolean;
}

export function Card({ title, eyebrow, trailing, children, noPadBody = false }: CardProps) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minWidth: 0
      }}
    >
      {(title || eyebrow || trailing) && (
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--surface-2)"
          }}
        >
          <div>
            {eyebrow && (
              <div
                className="mono"
                style={{ fontSize: 10, color: "var(--fg-5)", letterSpacing: "0.06em", marginBottom: 2 }}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-1)" }}>{title}</div>
            )}
          </div>
          {trailing}
        </div>
      )}
      <div style={{ padding: noPadBody ? 0 : 16, flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
