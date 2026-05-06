"use client";

import type { Dispatch, SetStateAction } from "react";
import { Field } from "./Field";
import type { WizardState } from "./types";

interface Props {
  state: WizardState;
  setState: Dispatch<SetStateAction<WizardState>>;
}

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

const monoInputStyle: React.CSSProperties = {
  ...inputStyle,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 11
};

export function StepIdentity({ state, setState }: Props) {
  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14
        }}
      >
        <Field label="Name" hint="lowercase, hyphenated">
          <input
            type="text"
            value={state.name}
            onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
            placeholder="procurement-agent"
            style={monoInputStyle}
          />
        </Field>
        <Field label="Role">
          <input
            type="text"
            value={state.role}
            onChange={(e) => setState((s) => ({ ...s, role: e.target.value }))}
            placeholder="data buyer"
            style={inputStyle}
          />
        </Field>
        <Field label="Model">
          <select
            value={state.model}
            onChange={(e) => setState((s) => ({ ...s, model: e.target.value }))}
            style={monoInputStyle}
          >
            <option value="claude-opus-4-7">claude-opus-4-7</option>
            <option value="claude-sonnet-4-6">claude-sonnet-4-6</option>
            <option value="gpt-5-pro">gpt-5-pro</option>
          </select>
        </Field>
        <Field label="Owner">
          <input
            type="email"
            value={state.owner}
            onChange={(e) => setState((s) => ({ ...s, owner: e.target.value }))}
            placeholder="rj@summer.dev"
            style={inputStyle}
          />
        </Field>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Persona" hint="One sentence describing how this agent should behave.">
            <textarea
              value={state.persona}
              onChange={(e) => setState((s) => ({ ...s, persona: e.target.value }))}
              placeholder="One sentence describing how this agent should behave."
              rows={3}
              style={{
                background: "var(--surface-0)",
                border: "1px solid var(--surface-2)",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 12,
                color: "var(--fg-1)",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit"
              }}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
