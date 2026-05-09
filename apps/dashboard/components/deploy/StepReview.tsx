"use client";

import type { ReactNode } from "react";
import type { AgentConnection } from "@/lib/types";
import type { WizardState } from "./types";

interface Props {
  state: WizardState;
  goToStep: (n: number) => void;
}

const KIND_ORDER: AgentConnection["kind"][] = ["data_source", "tool", "messaging", "identity"];
const KIND_LABEL: Record<AgentConnection["kind"], string> = {
  data_source: "DATA SOURCES",
  tool: "TOOLS",
  messaging: "MESSAGING",
  identity: "IDENTITY"
};

function Section({
  title,
  onEdit,
  children
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`review-${title.toLowerCase()}`}
      style={{
        borderBottom: "1px solid var(--surface-2)",
        padding: "14px 16px"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8
        }}
      >
        <h3
          id={`review-${title.toLowerCase()}`}
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--fg-5)",
            letterSpacing: "0.06em",
            margin: 0,
            fontWeight: 500
          }}
        >
          {title.toUpperCase()}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${title}`}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = "none";
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--accent)",
            fontSize: 11,
            cursor: "pointer",
            padding: 0
          }}
        >
          Edit
        </button>
      </div>
      <div>{children}</div>
    </section>
  );
}

function KV({ k, v, mono = false }: { k: string; v: ReactNode; mono?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "150px minmax(0, 1fr)",
        gap: 12,
        padding: "3px 0"
      }}
    >
      <span style={{ fontSize: 11, color: "var(--fg-4)" }}>{k}</span>
      <span
        className={mono ? "mono" : undefined}
        style={{ fontSize: 12, color: "var(--fg-1)", overflowWrap: "anywhere" }}
      >
        {v}
      </span>
    </div>
  );
}

const dash = <span style={{ color: "var(--fg-5)" }}>—</span>;

function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <span style={{ fontSize: 11, color: "var(--fg-5)", fontStyle: "italic" }}>
      {children}
    </span>
  );
}

export function StepReview({ state, goToStep }: Props) {
  const groupedConnections = KIND_ORDER.map((kind) => ({
    kind,
    items: state.connections.filter((c) => c.kind === kind)
  })).filter((g) => g.items.length > 0);

  return (
    <div
      style={{
        background: "var(--surface-0)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--surface-2)",
          fontSize: 13,
          color: "var(--fg-1)",
          fontWeight: 500
        }}
      >
        Review
      </div>

      <Section title="Identity" onEdit={() => goToStep(0)}>
        <KV k="name" v={state.name.trim().length > 0 ? state.name : dash} mono />
        <KV k="role" v={state.role.trim().length > 0 ? state.role : dash} />
        <KV k="model" v={state.model} mono />
        <KV k="owner" v={state.owner.trim().length > 0 ? state.owner : dash} />
        <KV
          k="persona"
          v={
            state.persona.trim().length > 0 ? (
              <span style={{ fontStyle: "italic", color: "var(--fg-2)" }}>{state.persona}</span>
            ) : (
              dash
            )
          }
        />
      </Section>

      <Section title="Connections" onEdit={() => goToStep(1)}>
        {state.connections.length === 0 ? (
          <EmptyHint>No systems wired up — optional.</EmptyHint>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 11, color: "var(--fg-4)" }}>
              {state.connections.length} connected
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10
              }}
            >
              {groupedConnections.map((g) => (
                <div key={g.kind}>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--fg-5)",
                      letterSpacing: "0.06em",
                      marginBottom: 4
                    }}
                  >
                    {KIND_LABEL[g.kind]}
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {g.items.map((c) => (
                      <li
                        key={c.id}
                        style={{ fontSize: 12, color: "var(--fg-1)", padding: "2px 0" }}
                      >
                        {c.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="Policies" onEdit={() => goToStep(2)}>
        {state.policies.length === 0 ? (
          <EmptyHint>No guardrails set — optional, but recommended.</EmptyHint>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {state.policies.map((p) => (
              <KV key={p.id} k={p.label} v={p.value} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
