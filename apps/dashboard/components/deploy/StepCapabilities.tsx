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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontSize: 13, color: "var(--fg-1)", fontWeight: 500 }}>
          Pick the commitment types this agent is permitted to emit.
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--fg-4)" }}>Pick at least one.</div>
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
              onClick={() => toggle(c)}
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
