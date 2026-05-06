"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  mono?: boolean;
  width?: number | string;
}

// Site-themed dropdown — replaces the native <select>'s OS chrome with a
// floating popover styled like every other surface in the app.
export function Select({ value, onChange, options, placeholder, mono = false, width }: SelectProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder ?? "";
  const displayColor = selected ? "var(--fg-1)" : "var(--fg-5)";

  return (
    <div ref={wrapRef} style={{ position: "relative", width }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          height: 32,
          padding: "0 28px 0 10px",
          background: "var(--surface-0)",
          border: `1px solid ${open ? "var(--accent-strong-border)" : "var(--surface-2)"}`,
          borderRadius: 8,
          fontSize: mono ? 11 : 12,
          fontFamily: mono ? "var(--font-mono)" : "inherit",
          color: displayColor,
          textAlign: "left",
          cursor: "pointer"
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
            flex: 1
          }}
        >
          {displayLabel}
        </span>
      </button>
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          marginTop: -6,
          color: "var(--fg-4)",
          pointerEvents: "none",
          transform: open ? "rotate(-90deg)" : "rotate(90deg)",
          transition: "transform 160ms ease",
          display: "inline-flex"
        }}
      >
        <Icon name="chevron-right" size={11} />
      </span>
      {open && (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            margin: 0,
            padding: 4,
            listStyle: "none",
            background: "var(--surface-1)",
            border: "1px solid var(--surface-2)",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            zIndex: 20,
            maxHeight: 220,
            overflowY: "auto",
            animation: "summer-popover-in 140ms ease-out"
          }}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 6,
                    fontFamily: mono ? "var(--font-mono)" : "inherit",
                    fontSize: mono ? 11 : 12,
                    color: active ? "var(--fg-0)" : "var(--fg-2)",
                    background: active ? "var(--surface-2)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "var(--surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      minWidth: 0
                    }}
                  >
                    {opt.label}
                  </span>
                  {active && (
                    <span style={{ color: "var(--accent)", display: "inline-flex" }}>
                      <Icon name="check" size={11} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
