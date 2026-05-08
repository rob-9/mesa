"use client";

import type { Dispatch, SetStateAction } from "react";
import { TypeLabel } from "@/components/primitives/TypeLabel";
import type { CommitmentType } from "@/lib/types";
import type { WizardState } from "./types";

interface Props {
  state: WizardState;
  setState: Dispatch<SetStateAction<WizardState>>;
}

const ALL_CAPABILITIES: CommitmentType[] = [
  "offer",
  "counter",
  "amendment",
  "approval",
  "signoff",
  "participant_joined",
  "scope_clause",
  "license_terms",
  "opt_out_delta",
  "usage_restriction",
  "dpa_reference"
];

export function StepCapabilities({ state, setState }: Props) {
  const toggle = (c: CommitmentType) => {
    setState((s) => {
      const has = s.capabilities.includes(c);
      return {
        ...s,
        capabilities: has ? s.capabilities.filter((x) => x !== c) : [...s.capabilities, c]
      };
    });
  };

  const isEmpty = state.capabilities.length === 0;

  const count = state.capabilities.length;

  return (
    <div
      role="group"
      aria-labelledby="capabilities-heading"
      aria-describedby="capabilities-hint"
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12
        }}
      >
        <div>
          <div
            id="capabilities-heading"
            style={{ fontSize: 13, color: "var(--fg-1)", fontWeight: 500 }}
          >
            Pick the commitment types this agent is permitted to emit.
          </div>
          <div
            id="capabilities-hint"
            style={{ marginTop: 4, fontSize: 12, color: isEmpty ? "var(--accent)" : "var(--fg-4)" }}
          >
            {isEmpty ? "Pick at least one to continue." : `${count} selected`}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8
        }}
      >
        {ALL_CAPABILITIES.map((c) => {
          const selected = state.capabilities.includes(c);
          return (
            <button
              key={c}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggle(c)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  toggle(c);
                }
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.borderColor = "var(--surface-3)";
                  e.currentTarget.style.background = "var(--surface-1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.borderColor = isEmpty
                    ? "var(--surface-3)"
                    : "var(--surface-2)";
                  e.currentTarget.style.background = "var(--surface-0)";
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 8,
                padding: "10px 12px",
                background: selected ? "var(--accent-soft)" : "var(--surface-0)",
                border: `1px solid ${selected ? "var(--accent)" : isEmpty ? "var(--surface-3)" : "var(--surface-2)"}`,
                borderRadius: 8,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.12s, border-color 0.12s"
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  border: `1px solid ${selected ? "var(--accent)" : "var(--surface-3)"}`,
                  background: selected ? "var(--accent)" : "transparent",
                  flexShrink: 0
                }}
              />
              <TypeLabel type={c} selected={selected} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
