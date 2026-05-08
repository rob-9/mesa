"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { Select } from "@/components/primitives/Select";
import { fixtureCounterparties } from "@/lib/counterparty-fixtures";
import type { Counterparty, CounterpartyAgent, TrustTier } from "@/lib/types";
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

  const cpOptions = counterparties.map((c) => ({
    value: c.slug,
    label: c.name
  }));
  const cpAgentOptions =
    cp?.representativeAgents.map((a) => ({
      value: a.id,
      label: `${a.name} — ${a.role}`
    })) ?? [];

  return (
    <div
      className="summer-page-in"
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Header strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          borderBottom: "1px solid var(--surface-2)"
        }}
      >
        <DeployedDot />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-0)" }}>
            {deployedAgent.name || "Agent"} deployed
          </span>
          <span style={{ fontSize: 11, color: "var(--fg-4)" }}>
            Connect to a counterparty agent to begin a deliberation.
          </span>
        </div>
      </div>

      {phase === "form" && (
        <FormPhase
          deployedAgent={deployedAgent}
          cp={cp}
          cpAgent={cpAgent}
          counterpartySlug={counterpartySlug}
          onCounterpartyChange={onCounterpartyChange}
          agentId={agentId}
          setAgentId={setAgentId}
          cpOptions={cpOptions}
          cpAgentOptions={cpAgentOptions}
          scope={scope}
          setScope={setScope}
          canRequest={canRequest}
          onRequest={onRequest}
        />
      )}
      {phase === "waiting" && cp && cpAgent && (
        <WaitingPhase counterpartyName={cp.name} cpAgentName={cpAgent.name} />
      )}
      {phase === "accepted" && cp && cpAgent && (
        <AcceptedPhase counterpartyName={cp.name} cpAgentName={cpAgent.name} />
      )}
    </div>
  );
}

// ─── Form phase ─────────────────────────────────────────────────────────────

interface FormPhaseProps {
  deployedAgent: WizardState;
  cp: Counterparty | undefined;
  cpAgent: CounterpartyAgent | undefined;
  counterpartySlug: string;
  onCounterpartyChange: (slug: string) => void;
  agentId: string;
  setAgentId: (id: string) => void;
  cpOptions: { value: string; label: string }[];
  cpAgentOptions: { value: string; label: string }[];
  scope: string;
  setScope: (s: string) => void;
  canRequest: boolean;
  onRequest: () => void;
}

function FormPhase({
  deployedAgent,
  cp,
  cpAgent,
  counterpartySlug,
  onCounterpartyChange,
  agentId,
  setAgentId,
  cpOptions,
  cpAgentOptions,
  scope,
  setScope,
  canRequest,
  onRequest
}: FormPhaseProps) {
  const cpAgentDisabled = !cp;

  return (
    <>
      {/* Handshake row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 64px 1fr",
          alignItems: "stretch",
          padding: "16px 18px 0",
          gap: 0
        }}
      >
        <YouCard agent={deployedAgent} />
        <Connector active={!!cpAgent} />
        {cp && cpAgent ? (
          <ThemCard counterparty={cp} agent={cpAgent} />
        ) : (
          <PlaceholderCard
            hint={cp ? "Select an agent below" : "Select a counterparty below"}
          />
        )}
      </div>

      {/* Selectors row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          padding: "16px 18px 6px"
        }}
      >
        <Field label="COUNTERPARTY">
          <Select
            value={counterpartySlug}
            onChange={onCounterpartyChange}
            options={cpOptions}
            placeholder="Select counterparty…"
          />
        </Field>
        <Field label="THEIR AGENT">
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
      </div>

      {/* Scope + send */}
      <div
        style={{
          padding: "10px 18px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10
        }}
      >
        <Field label="SCOPE OF CONVERSATION">
          <textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            rows={2}
            placeholder="License training-data Q4 corpus for $250k, signoff by Friday."
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
              minHeight: 60,
              outline: "none",
              lineHeight: 1.5
            }}
          />
        </Field>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span style={{ fontSize: 11, color: "var(--fg-5)" }}>
            Both sides will see this scope.
          </span>
          <PrimaryButton label="Request to chat" enabled={canRequest} onClick={onRequest} />
        </div>
      </div>
    </>
  );
}

// ─── Cards ──────────────────────────────────────────────────────────────────

function YouCard({ agent }: { agent: WizardState }) {
  const letter = (agent.name || "A").charAt(0).toUpperCase();
  const caps = agent.capabilities.slice(0, 3);
  const more = Math.max(0, agent.capabilities.length - caps.length);
  return (
    <SideCard
      tone="accent"
      letter={letter}
      name={agent.name || "Your agent"}
      sub={agent.role || "agent"}
      sideLabel="YOU"
      chips={caps}
      extraChip={more > 0 ? `+${more}` : null}
      mono={agent.model}
    />
  );
}

function ThemCard({
  counterparty,
  agent
}: {
  counterparty: Counterparty;
  agent: CounterpartyAgent;
}) {
  return (
    <SideCard
      tone="neutral"
      letter={agent.name.charAt(0).toUpperCase()}
      name={agent.name}
      sub={agent.role}
      sideLabel="THEM"
      chips={[counterparty.name]}
      chipAccent
      mono={counterparty.principals[0]?.keyFingerprint}
      trailing={<TrustBadge tier={counterparty.trustTier} />}
    />
  );
}

function SideCard({
  tone,
  letter,
  name,
  sub,
  chips,
  chipAccent = false,
  extraChip = null,
  mono,
  sideLabel,
  trailing
}: {
  tone: "accent" | "neutral";
  letter: string;
  name: string;
  sub: string;
  chips: string[];
  chipAccent?: boolean;
  extraChip?: string | null;
  mono?: string;
  sideLabel: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 12,
        background: "var(--surface-0)",
        border: `1px solid ${tone === "accent" ? "rgba(217,119,87,0.30)" : "var(--surface-2)"}`,
        borderRadius: 10,
        boxShadow:
          tone === "accent"
            ? "inset 0 0 0 1px rgba(217,119,87,0.06)"
            : undefined
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar letter={letter} size={28} tone={tone} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            flex: 1,
            lineHeight: 1.25
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--fg-0)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {name}
          </span>
          <span style={{ fontSize: 11, color: "var(--fg-4)" }}>{sub}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {trailing}
          <MicroLabel>{sideLabel}</MicroLabel>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {chips.map((c) => (
          <Pill key={c} label={c} accent={chipAccent} />
        ))}
        {extraChip && <Pill label={extraChip} />}
      </div>
      {mono && (
        <span
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--fg-5)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {mono}
        </span>
      )}
    </div>
  );
}

function PlaceholderCard({ hint }: { hint: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 18,
        background: "var(--surface-0)",
        border: "1px dashed var(--surface-3)",
        borderRadius: 10,
        minHeight: 116
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--surface-1)",
          border: "1px dashed var(--surface-3)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--fg-5)"
        }}
      >
        <Icon name="agent" size={13} />
      </div>
      <div style={{ fontSize: 11, color: "var(--fg-5)", textAlign: "center" }}>
        {hint}
      </div>
    </div>
  );
}

function Connector({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: 1,
          background: active
            ? "linear-gradient(90deg, var(--surface-3), var(--accent), var(--surface-3))"
            : "var(--surface-3)",
          transform: "translateY(-0.5px)"
        }}
      />
      <div
        style={{
          position: "relative",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "var(--surface-1)",
          border: `1px solid ${active ? "var(--accent)" : "var(--surface-3)"}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: active ? "var(--accent)" : "var(--fg-5)",
          transition: "color 220ms ease, border-color 220ms ease"
        }}
      >
        <Icon name="chevron-right" size={10} />
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function DeployedDot() {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: 8,
        background: "rgba(120, 200, 140, 0.14)",
        border: "1px solid rgba(120, 200, 140, 0.45)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgb(120, 200, 140)",
        flexShrink: 0
      }}
    >
      <Icon name="check" size={11} />
    </div>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <MicroLabel>{label}</MicroLabel>
      {children}
    </div>
  );
}

// ─── Waiting / Accepted phases ──────────────────────────────────────────────

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

// ─── Shared visual primitives ───────────────────────────────────────────────

function Avatar({
  letter,
  size = 32,
  tone = "neutral"
}: {
  letter: string;
  size?: number;
  tone?: "accent" | "neutral";
}) {
  const bg = tone === "accent" ? "var(--accent)" : "var(--surface-3)";
  const fg = tone === "accent" ? "var(--bg)" : "var(--fg-1)";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: fg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.42),
        fontWeight: 600,
        flexShrink: 0
      }}
    >
      {letter}
    </div>
  );
}

function TrustBadge({ tier }: { tier: TrustTier }) {
  const styles: Record<TrustTier, { bg: string; bd: string; fg: string; label: string }> = {
    verified: {
      bg: "rgba(120, 200, 140, 0.12)",
      bd: "rgba(120, 200, 140, 0.35)",
      fg: "rgb(120, 200, 140)",
      label: "verified"
    },
    standard: {
      bg: "var(--surface-2)",
      bd: "var(--surface-3)",
      fg: "var(--fg-3)",
      label: "standard"
    },
    watchlist: {
      bg: "rgba(220, 170, 90, 0.10)",
      bd: "rgba(220, 170, 90, 0.35)",
      fg: "rgb(220, 170, 90)",
      label: "watchlist"
    }
  };
  const s = styles[tier];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: 16,
        padding: "0 6px",
        borderRadius: 8,
        background: s.bg,
        border: `1px solid ${s.bd}`,
        color: s.fg,
        fontSize: 10,
        fontWeight: 500
      }}
    >
      {tier === "verified" && <Icon name="check" size={9} />}
      {s.label}
    </span>
  );
}

function Pill({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 18,
        padding: "0 8px",
        borderRadius: 9,
        background: accent ? "rgba(217,119,87,0.12)" : "var(--surface-2)",
        color: accent ? "var(--accent)" : "var(--fg-2)",
        border: accent ? "1px solid rgba(217,119,87,0.30)" : "1px solid transparent",
        fontSize: 10,
        fontWeight: 500,
        whiteSpace: "nowrap"
      }}
    >
      {label}
    </span>
  );
}

function MicroLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mono"
      style={{
        fontSize: 9,
        color: "var(--fg-5)",
        letterSpacing: "0.10em",
        textTransform: "uppercase"
      }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({
  label,
  onClick,
  enabled = true,
  trailing = "→"
}: {
  label: string;
  onClick?: () => void;
  enabled?: boolean;
  trailing?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled}
      style={{
        height: 32,
        padding: "0 14px",
        background: enabled ? "var(--accent)" : "var(--surface-2)",
        color: enabled ? "var(--bg)" : "var(--fg-4)",
        border: "1px solid",
        borderColor: enabled ? "var(--accent)" : "var(--surface-2)",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        cursor: enabled ? "pointer" : "not-allowed",
        display: "inline-flex",
        alignItems: "center",
        gap: 6
      }}
    >
      {label}
      {trailing && <span style={{ opacity: 0.85 }}>{trailing}</span>}
    </button>
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
