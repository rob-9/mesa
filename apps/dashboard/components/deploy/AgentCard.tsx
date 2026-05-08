"use client";

import { Icon } from "@/components/icons/Icon";
import type { WizardState } from "./types";

interface Props {
  agent: WizardState;
  // Optional side-label badge ("YOU"). Hidden when omitted.
  sideLabel?: string;
  // Higher density when used inside the connect screen, where space is tight.
  // Looser when used as a preview panel inside the Identity step.
  density?: "compact" | "comfortable";
}

// Visual identity for a deployed (or about-to-be-deployed) agent.
// Used both as the left card on the connect screen and as a live preview
// on the Identity step of the deploy wizard.
export function AgentCard({ agent, sideLabel, density = "compact" }: Props) {
  const letter = (agent.name || "A").trim().charAt(0).toUpperCase() || "A";
  const caps = agent.capabilities.slice(0, 4);
  const more = Math.max(0, agent.capabilities.length - caps.length);
  const padding = density === "compact" ? 12 : 16;
  const gap = density === "compact" ? 10 : 12;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap,
        padding,
        background: "var(--surface-0)",
        border: "1px solid rgba(217,119,87,0.30)",
        borderRadius: 10,
        boxShadow: "inset 0 0 0 1px rgba(217,119,87,0.06)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar letter={letter} />
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
            {agent.name || <span style={{ color: "var(--fg-5)" }}>your-agent</span>}
          </span>
          <span style={{ fontSize: 11, color: "var(--fg-4)" }}>
            {agent.role || <span style={{ color: "var(--fg-5)" }}>role</span>}
          </span>
        </div>
        {sideLabel && <MicroLabel>{sideLabel}</MicroLabel>}
      </div>

      {/* Persona — italic 1-2 line description */}
      <div
        style={{
          fontSize: 11,
          color: agent.persona ? "var(--fg-3)" : "var(--fg-5)",
          fontStyle: "italic",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: density === "compact" ? 2 : 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}
      >
        {agent.persona ? `“${agent.persona}”` : "Persona will appear here as you type."}
      </div>

      <Divider />

      <Section label="CAPABILITIES">
        {caps.length === 0 ? (
          <span style={{ fontSize: 11, color: "var(--fg-5)" }}>—</span>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {caps.map((c) => (
              <Pill key={c} label={c} />
            ))}
            {more > 0 && <Pill label={`+${more}`} />}
          </div>
        )}
      </Section>

      <Divider />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10
        }}
      >
        <Section label="MODEL">
          <Mono>{agent.model || "—"}</Mono>
        </Section>
        <Section label="OWNER">
          <Mono>{agent.owner || "—"}</Mono>
        </Section>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 11,
          color: "var(--fg-4)",
          marginTop: 2
        }}
      >
        <StatChip
          icon="briefcase"
          label={`${agent.connections.length} ${agent.connections.length === 1 ? "connection" : "connections"}`}
        />
        <StatChip
          icon="shield"
          label={`${agent.policies.length} ${agent.policies.length === 1 ? "policy" : "policies"}`}
        />
      </div>
    </div>
  );
}

function Avatar({ letter }: { letter: string }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "var(--accent)",
        color: "var(--bg)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 600,
        flexShrink: 0
      }}
    >
      {letter}
    </div>
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

function Pill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 18,
        padding: "0 8px",
        borderRadius: 9,
        background: "var(--surface-2)",
        color: "var(--fg-2)",
        fontSize: 10,
        fontWeight: 500,
        whiteSpace: "nowrap"
      }}
    >
      {label}
    </span>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mono"
      style={{
        fontSize: 11,
        color: "var(--fg-2)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        display: "block"
      }}
    >
      {children}
    </span>
  );
}

function Section({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <MicroLabel>{label}</MicroLabel>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--surface-2)" }} />;
}

function StatChip({
  icon,
  label
}: {
  icon: "briefcase" | "shield";
  label: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 20,
        padding: "0 8px",
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: 6,
        color: "var(--fg-3)",
        fontSize: 10
      }}
    >
      <Icon name={icon} size={10} />
      {label}
    </span>
  );
}
