"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

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
  const bodyRef = useRef<HTMLDivElement>(null);

  // On step change, focus the first focusable element in the body so keyboard
  // users land on the new step's primary input, and screen readers announce it.
  useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;
    const focusable = root.querySelector<HTMLElement>(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus({ preventScroll: true });
    root.scrollTop = 0;
  }, [current]);

  // Cmd/Ctrl+Enter advances the wizard from anywhere in the body — including
  // textareas where a plain Enter inserts a newline.
  const onBodyKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !nextDisabled && onNext) {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flex: "1 1 0",
        minHeight: 0
      }}
    >
      {/* progress strip */}
      <ol
        aria-label={`Step ${current + 1} of ${steps.length}: ${steps[current]?.label ?? ""}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 18px",
          borderBottom: "1px solid var(--surface-2)",
          background: "var(--surface-1)",
          flexShrink: 0,
          margin: 0,
          listStyle: "none"
        }}
      >
        {steps.map((s, i) => {
          const reached = i <= current;
          const isCurrent = i === current;
          return (
            <li
              key={s.id}
              aria-current={isCurrent ? "step" : undefined}
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
            </li>
          );
        })}
      </ol>

      {/* body — scrolls internally so the footer Deploy button stays visible */}
      <div
        ref={bodyRef}
        onKeyDown={onBodyKeyDown}
        role="region"
        aria-label={steps[current]?.label}
        style={{
          padding: "22px 22px 26px",
          flex: "1 1 0",
          minHeight: 0,
          overflowY: "auto"
        }}
      >
        {children}
      </div>

      {/* footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 18px",
          borderTop: "1px solid var(--surface-2)",
          background: "var(--surface-1)",
          flexShrink: 0
        }}
      >
        <button
          type="button"
          onClick={onPrev}
          disabled={!onPrev}
          aria-label="Previous step"
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            aria-hidden
            style={{
              fontSize: 10,
              color: "var(--fg-5)",
              letterSpacing: "0.04em",
              display: "inline-flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <kbd
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 16,
                padding: "0 5px",
                background: "var(--surface-2)",
                border: "1px solid var(--surface-3)",
                borderRadius: 4,
                fontSize: 9,
                fontFamily: "var(--font-mono, monospace)",
                color: "var(--fg-3)"
              }}
            >
              ⌘↵
            </kbd>
            to advance
          </span>
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || !onNext}
            aria-keyshortcuts="Meta+Enter Control+Enter"
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
              cursor: nextDisabled ? "not-allowed" : "pointer",
              transition: "filter 120ms ease"
            }}
            onMouseEnter={(e) => {
              if (!nextDisabled) e.currentTarget.style.filter = "brightness(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "";
            }}
          >
            {nextLabel} →
          </button>
        </div>
      </div>
    </div>
  );
}
