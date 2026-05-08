"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { AgentPolicy } from "@/lib/types";
import { Field } from "./Field";
import type { WizardState } from "./types";

interface Props {
  state: WizardState;
  setState: Dispatch<SetStateAction<WizardState>>;
}

const POLICY_SLOTS = [
  {
    id: "spend-cap",
    label: "Spend cap (per deliberation)",
    placeholder: "$250,000",
    rationale: "above this requires human signoff"
  },
  {
    id: "signoff",
    label: "Signoff threshold",
    placeholder: "human required",
    rationale: "all signoffs route to human review"
  },
  {
    id: "counterparties",
    label: "Allowed counterparties",
    placeholder: "publishers, news, code corpora",
    rationale: "scopes who this agent can negotiate with"
  },
  {
    id: "daily-cap",
    label: "Daily commitment cap",
    placeholder: "12 / day",
    rationale: "throttle so audit stays reviewable"
  }
];

const inputStyle: React.CSSProperties = {
  background: "var(--surface-0)",
  border: "1px solid var(--surface-2)",
  borderRadius: 8,
  height: 32,
  padding: "0 10px",
  fontSize: 12,
  color: "var(--fg-1)",
  outline: "none"
};

const CUSTOM_ID = "custom-1";

export function StepPolicies({ state, setState }: Props) {
  // Derive current values keyed by slot id.
  const slotValues = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of state.policies) {
      map[p.id] = p.value;
    }
    return map;
  }, [state.policies]);

  const customExisting = state.policies.find((p) => p.id === CUSTOM_ID) ?? null;
  const [customOpen, setCustomOpen] = useState<boolean>(customExisting !== null);
  const [customLabel, setCustomLabel] = useState<string>(customExisting?.label ?? "");
  const [customValue, setCustomValue] = useState<string>(customExisting?.value ?? "");
  const [customRationale, setCustomRationale] = useState<string>(customExisting?.rationale ?? "");

  const writePolicies = (next: AgentPolicy[]) => {
    setState((s) => ({ ...s, policies: next }));
  };

  const updateSlot = (slotId: string, value: string) => {
    const slot = POLICY_SLOTS.find((p) => p.id === slotId)!;
    const trimmed = value;
    setState((s) => {
      const others = s.policies.filter((p) => p.id !== slotId);
      if (trimmed.trim().length === 0) {
        return { ...s, policies: others };
      }
      const updated: AgentPolicy = {
        id: slot.id,
        label: slot.label,
        value: trimmed,
        rationale: slot.rationale
      };
      return { ...s, policies: [...others, updated] };
    });
  };

  const syncCustom = (
    nextLabel: string,
    nextValue: string,
    nextRationale: string
  ) => {
    setState((s) => {
      const others = s.policies.filter((p) => p.id !== CUSTOM_ID);
      if (nextLabel.trim().length === 0 || nextValue.trim().length === 0) {
        return { ...s, policies: others };
      }
      const updated: AgentPolicy = {
        id: CUSTOM_ID,
        label: nextLabel,
        value: nextValue,
        rationale: nextRationale.trim().length > 0 ? nextRationale : undefined
      };
      return { ...s, policies: [...others, updated] };
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 720 }}>
      <div>
        <div style={{ fontSize: 13, color: "var(--fg-1)", fontWeight: 500 }}>
          Set the guardrails this agent will enforce.
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--fg-4)" }}>
          Optional. Empty slots are skipped.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {POLICY_SLOTS.map((slot) => (
          <Field key={slot.id} label={slot.label} hint={slot.rationale}>
            <input
              type="text"
              value={slotValues[slot.id] ?? ""}
              onChange={(e) => updateSlot(slot.id, e.target.value)}
              placeholder={slot.placeholder}
              style={inputStyle}
            />
          </Field>
        ))}
      </div>

      <div
        style={{
          marginTop: 4,
          background: "var(--surface-0)",
          border: "1px solid var(--surface-2)",
          borderRadius: "var(--r-card)",
          padding: "12px 14px"
        }}
      >
        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          aria-expanded={customOpen}
          aria-controls="custom-policy-panel"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--fg-2)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <span
            aria-hidden
            style={{
              fontSize: 10,
              color: "var(--fg-4)",
              display: "inline-block",
              transition: "transform 150ms ease",
              transform: customOpen ? "rotate(90deg)" : "rotate(0deg)"
            }}
          >
            ▸
          </span>
          Custom policy
          {!customOpen && (
            <span style={{ fontSize: 11, color: "var(--fg-5)", fontWeight: 400 }}>
              — add a one-off rule not covered above
            </span>
          )}
        </button>
        {customOpen && (
          <div
            id="custom-policy-panel"
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12
            }}
          >
            <Field label="Label">
              <input
                type="text"
                value={customLabel}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomLabel(v);
                  syncCustom(v, customValue, customRationale);
                }}
                placeholder="Override path"
                style={inputStyle}
              />
            </Field>
            <Field label="Value">
              <input
                type="text"
                value={customValue}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomValue(v);
                  syncCustom(customLabel, v, customRationale);
                }}
                placeholder="GC + CISO"
                style={inputStyle}
              />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Rationale" hint="optional">
                <input
                  type="text"
                  value={customRationale}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomRationale(v);
                    syncCustom(customLabel, customValue, v);
                  }}
                  placeholder="why this exists"
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
