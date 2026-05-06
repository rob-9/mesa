"use client";

import type { ReactNode } from "react";

interface Step {
  id: string;
  label: string;
}

interface Props {
  steps: Step[];
  current: number;
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  children: ReactNode;
}

export function WizardShell({
  steps,
  current,
  onPrev,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  children
}: Props) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      {/* progress strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 18px",
          borderBottom: "1px solid var(--surface-2)",
          background: "var(--surface-1)"
        }}
      >
        {steps.map((s, i) => {
          const reached = i <= current;
          return (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: i === steps.length - 1 ? "0 0 auto" : "1 1 auto",
                minWidth: 0
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  fontSize: 10,
                  fontWeight: 600,
                  background: reached ? "var(--accent)" : "transparent",
                  color: reached ? "var(--bg)" : "var(--fg-4)",
                  border: reached ? "1px solid var(--accent)" : "1px solid var(--surface-3)",
                  flexShrink: 0
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: reached ? "var(--fg-1)" : "var(--fg-4)",
                  fontWeight: i === current ? 500 : 400,
                  whiteSpace: "nowrap"
                }}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  style={{
                    flex: 1,
                    height: 1,
                    background: i < current ? "var(--accent)" : "var(--surface-3)",
                    marginLeft: 4,
                    minWidth: 12
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* body */}
      <div style={{ padding: "22px 22px 26px", minHeight: 320 }}>{children}</div>

      {/* footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 18px",
          borderTop: "1px solid var(--surface-2)",
          background: "var(--surface-1)"
        }}
      >
        <button
          type="button"
          onClick={onPrev}
          disabled={!onPrev}
          style={{
            height: 30,
            padding: "0 14px",
            background: "transparent",
            color: onPrev ? "var(--fg-2)" : "var(--fg-5)",
            border: "1px solid var(--surface-2)",
            borderRadius: 8,
            fontSize: 12,
            cursor: onPrev ? "pointer" : "not-allowed"
          }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || !onNext}
          style={{
            height: 30,
            padding: "0 16px",
            background: nextDisabled ? "var(--surface-2)" : "var(--accent)",
            color: nextDisabled ? "var(--fg-4)" : "var(--bg)",
            border: "1px solid",
            borderColor: nextDisabled ? "var(--surface-2)" : "var(--accent)",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            cursor: nextDisabled ? "not-allowed" : "pointer"
          }}
        >
          {nextLabel} →
        </button>
      </div>
    </div>
  );
}
