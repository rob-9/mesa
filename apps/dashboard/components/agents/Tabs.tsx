"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export interface TabSpec {
  id: string;
  label: string;
  count?: number; // optional small mono count next to the label
  content: ReactNode;
}

export function Tabs({
  tabs,
  initialId,
  height
}: {
  tabs: TabSpec[];
  initialId?: string;
  height?: number;
}) {
  const [active, setActive] = useState(initialId ?? tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        height
      }}
    >
      {/* tab strip */}
      <div
        style={{
          display: "flex",
          gap: 24,
          padding: "0 20px",
          borderBottom: "1px solid var(--surface-2)"
        }}
      >
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              style={{
                appearance: "none",
                background: "transparent",
                border: "none",
                padding: "14px 0",
                cursor: "pointer",
                color: isActive ? "var(--fg-0)" : "var(--fg-3)",
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>{t.label}</span>
              {typeof t.count === "number" && (
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-5)" }}>
                  {t.count}
                </span>
              )}
              {isActive && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -1,
                    height: 2,
                    background: "var(--accent)"
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      {/* panel */}
      <div style={{ minWidth: 0, flex: 1, minHeight: 0, overflowY: "auto" }}>
        {current.content}
      </div>
    </div>
  );
}
