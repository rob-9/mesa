import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  required,
  children
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500 }}>
        {label}
        {required && (
          <span aria-hidden style={{ marginLeft: 4, color: "var(--accent)" }}>
            *
          </span>
        )}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11, color: "var(--fg-5)" }}>{hint}</span>}
    </label>
  );
}
