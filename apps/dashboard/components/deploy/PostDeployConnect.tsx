"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { Select } from "@/components/primitives/Select";
import { fixtureCounterparties } from "@/lib/counterparty-fixtures";
import type { WizardState } from "./types";

type Phase = "form" | "waiting" | "accepted";

interface Props {
  deployedAgent: WizardState;
  onComplete: () => void;
}

export function PostDeployConnect({ deployedAgent, onComplete }: Props) {
  const [counterpartySlug, setCounterpartySlug] = useState("");
  const [agentId, setAgentId] = useState("");
  const [scope, setScope] = useState("");
  const [phase, setPhase] = useState<Phase>("form");

  const counterparties = useMemo(() => fixtureCounterparties(), []);
  const cp = counterparties.find((c) => c.slug === counterpartySlug);
  const cpAgent = cp?.representativeAgents.find((a) => a.id === agentId);

  const cpOptions = counterparties.map((c) => ({
    value: c.slug,
    label: `${c.name} · ${c.domain}`
  }));
  const cpAgentOptions =
    cp?.representativeAgents.map((a) => ({
      value: a.id,
      label: `${a.name} — ${a.role}`
    })) ?? [];

  const onCounterpartyChange = (slug: string) => {
    setCounterpartySlug(slug);
    setAgentId("");
  };

  const canRequest = !!cp && !!cpAgent && scope.trim().length > 0;

  useEffect(() => {
    if (phase === "waiting") {
      const t = setTimeout(() => setPhase("accepted"), 2500);
      return () => clearTimeout(t);
    }
    if (phase === "accepted") {
      const t = setTimeout(() => onComplete(), 900);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  const onRequest = () => {
    if (!canRequest) return;
    setPhase("waiting");
  };

  return (
    <div
      className="summer-page-in"
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "18px 22px",
          borderBottom: "1px solid var(--surface-2)"
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "rgba(120, 200, 140, 0.12)",
            border: "1px solid rgba(120, 200, 140, 0.35)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgb(120, 200, 140)",
            flexShrink: 0
          }}
        >
          <Icon name="check" size={14} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: "var(--fg-0)",
              letterSpacing: "-0.01em"
            }}
          >
            {deployedAgent.name || "Agent"} deployed
          </h2>
          <div style={{ fontSize: 12, color: "var(--fg-4)" }}>
            Connect this agent to a counterparty agent to start a deliberation.
          </div>
        </div>
      </div>

      <div style={{ padding: "22px 22px 26px", minHeight: 320 }}>
        {phase === "form" && (
          <FormPhase
            counterpartyOptions={cpOptions}
            counterpartySlug={counterpartySlug}
            onCounterpartyChange={onCounterpartyChange}
            cpAgentOptions={cpAgentOptions}
            cpAgentDisabled={!cp}
            agentId={agentId}
            setAgentId={setAgentId}
            scope={scope}
            setScope={setScope}
            canRequest={canRequest}
            onRequest={onRequest}
            counterpartyName={cp?.name ?? ""}
          />
        )}
        {phase === "waiting" && cp && cpAgent && (
          <WaitingPhase counterpartyName={cp.name} cpAgentName={cpAgent.name} />
        )}
        {phase === "accepted" && cp && cpAgent && (
          <AcceptedPhase counterpartyName={cp.name} cpAgentName={cpAgent.name} />
        )}
      </div>
    </div>
  );
}

interface FormPhaseProps {
  counterpartyOptions: { value: string; label: string }[];
  counterpartySlug: string;
  onCounterpartyChange: (slug: string) => void;
  cpAgentOptions: { value: string; label: string }[];
  cpAgentDisabled: boolean;
  agentId: string;
  setAgentId: (id: string) => void;
  scope: string;
  setScope: (s: string) => void;
  canRequest: boolean;
  onRequest: () => void;
  counterpartyName: string;
}

function FormPhase({
  counterpartyOptions,
  counterpartySlug,
  onCounterpartyChange,
  cpAgentOptions,
  cpAgentDisabled,
  agentId,
  setAgentId,
  scope,
  setScope,
  canRequest,
  onRequest,
  counterpartyName
}: FormPhaseProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 560 }}>
      <Field
        label="Counterparty"
        hint="Pick the organization your agent should reach out to."
      >
        <Select
          value={counterpartySlug}
          onChange={onCounterpartyChange}
          options={counterpartyOptions}
          placeholder="Select counterparty…"
        />
      </Field>

      <Field
        label="Counterparty agent"
        hint={
          cpAgentDisabled
            ? "Choose a counterparty first."
            : `Connected agents on ${counterpartyName}'s side.`
        }
      >
        <div
          style={{
            opacity: cpAgentDisabled ? 0.5 : 1,
            pointerEvents: cpAgentDisabled ? "none" : "auto"
          }}
        >
          <Select
            value={agentId}
            onChange={setAgentId}
            options={cpAgentOptions}
            placeholder={cpAgentDisabled ? "—" : "Select their agent…"}
          />
        </div>
      </Field>

      <Field
        label="Scope of conversation"
        hint="What should this conversation cover? Both sides will see this."
      >
        <textarea
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          rows={3}
          placeholder="e.g. License training-data Q4 corpus for $250k, signoff by Friday."
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "var(--surface-0)",
            border: "1px solid var(--surface-2)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--fg-1)",
            fontFamily: "inherit",
            resize: "vertical",
            minHeight: 72,
            outline: "none"
          }}
        />
      </Field>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
        <button
          type="button"
          onClick={onRequest}
          disabled={!canRequest}
          style={{
            height: 32,
            padding: "0 16px",
            background: canRequest ? "var(--accent)" : "var(--surface-2)",
            color: canRequest ? "var(--bg)" : "var(--fg-4)",
            border: "1px solid",
            borderColor: canRequest ? "var(--accent)" : "var(--surface-2)",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            cursor: canRequest ? "pointer" : "not-allowed"
          }}
        >
          Request to chat →
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "var(--fg-2)",
          letterSpacing: "0.02em"
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <span style={{ fontSize: 11, color: "var(--fg-5)" }}>{hint}</span>
      )}
    </div>
  );
}

function WaitingPhase({
  counterpartyName,
  cpAgentName
}: {
  counterpartyName: string;
  cpAgentName: string;
}) {
  return (
    <div
      className="typing-indicator-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: "48px 22px",
        textAlign: "center"
      }}
    >
      <div style={{ display: "inline-flex", gap: 6 }}>
        <span className="typing-dot" style={{ animationDelay: "0s" }} />
        <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
        <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
      </div>
      <div style={{ fontSize: 13, color: "var(--fg-1)", fontWeight: 500 }}>
        Waiting for {counterpartyName}…
      </div>
      <div style={{ fontSize: 11, color: "var(--fg-5)" }}>
        Request sent to {cpAgentName}.
      </div>
    </div>
  );
}

function AcceptedPhase({
  counterpartyName,
  cpAgentName
}: {
  counterpartyName: string;
  cpAgentName: string;
}) {
  return (
    <div
      className="typing-indicator-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "48px 22px",
        textAlign: "center"
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(120, 200, 140, 0.14)",
          border: "1px solid rgba(120, 200, 140, 0.45)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgb(120, 200, 140)"
        }}
      >
        <Icon name="check" size={16} />
      </div>
      <div style={{ fontSize: 13, color: "var(--fg-1)", fontWeight: 500 }}>
        {cpAgentName} accepted.
      </div>
      <div style={{ fontSize: 11, color: "var(--fg-5)" }}>
        Opening deliberation with {counterpartyName}…
      </div>
    </div>
  );
}
