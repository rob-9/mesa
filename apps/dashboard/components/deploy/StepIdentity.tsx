"use client";

import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { Select } from "@/components/primitives/Select";
import { AgentCard } from "./AgentCard";
import { Field } from "./Field";
import type { WizardState } from "./types";

interface Props {
  state: WizardState;
  setState: Dispatch<SetStateAction<WizardState>>;
}

const inputStyle: CSSProperties = {
  background: "var(--surface-0)",
  border: "1px solid var(--surface-2)",
  borderRadius: 8,
  height: 32,
  padding: "0 10px",
  fontSize: 12,
  color: "var(--fg-1)",
  outline: "none"
};

const monoInputStyle: CSSProperties = {
  ...inputStyle,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 11
};

export function StepIdentity({ state, setState }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 1fr)",
        gap: 22,
        alignItems: "stretch"
      }}
    >
      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
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
          <Field label="Role" hint="human-readable">
            <input
              type="text"
              value={state.role}
              onChange={(e) => setState((s) => ({ ...s, role: e.target.value }))}
              placeholder="data buyer"
              style={inputStyle}
            />
          </Field>
          <Field label="Model">
            <Select
              value={state.model}
              onChange={(value) => setState((s) => ({ ...s, model: value }))}
              options={[
                { value: "claude-opus-4-7", label: "claude-opus-4-7" },
                { value: "claude-sonnet-4-6", label: "claude-sonnet-4-6" },
                { value: "gpt-5-pro", label: "gpt-5-pro" }
              ]}
              mono
            />
          </Field>
          <Field label="Owner">
            <input
              type="email"
              value={state.owner}
              onChange={(e) => setState((s) => ({ ...s, owner: e.target.value }))}
              placeholder="rj@mesa.dev"
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Persona — flexes to fill so the textarea's bottom edge lines up
            with the bottom of the live preview card on the right. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            flex: 1,
            minHeight: 0
          }}
        >
          <span style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500 }}>
            Persona
          </span>
          <textarea
            value={state.persona}
            onChange={(e) => setState((s) => ({ ...s, persona: e.target.value }))}
            placeholder="Sources licensed training data within budget. Pushes for non-exclusive terms and short renewal windows."
            style={{
              background: "var(--surface-0)",
              border: "1px solid var(--surface-2)",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 12,
              color: "var(--fg-1)",
              outline: "none",
              fontFamily: "inherit",
              resize: "vertical",
              flex: 1,
              minHeight: 76,
              lineHeight: 1.5
            }}
          />
        </div>
      </div>

      {/* Live preview — wrapper mirrors Field's label/gap so it lines up
          with the form's Name/Role labels on the left column. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          position: "sticky",
          top: 0
        }}
      >
        <span style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500 }}>
          Preview
        </span>
        <AgentCard agent={state} density="comfortable" />
      </div>
    </div>
  );
}
