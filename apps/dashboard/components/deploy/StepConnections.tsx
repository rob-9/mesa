"use client";

import type { Dispatch, SetStateAction } from "react";
import type { AgentConnection } from "@/lib/types";
import type { WizardState } from "./types";

interface Props {
  state: WizardState;
  setState: Dispatch<SetStateAction<WizardState>>;
}

const CATALOG: AgentConnection[] = [
  // data_source
  {
    id: "company-knowledge-graph",
    name: "company-knowledge-graph",
    kind: "data_source",
    description: "internal commitment + counterparty graph",
    status: "connected",
    scope: "read"
  },
  {
    id: "pricing-db",
    name: "pricing-db",
    kind: "data_source",
    description: "rate cards and historical deals",
    status: "connected",
    scope: "read"
  },
  {
    id: "data-catalog",
    name: "data-catalog",
    kind: "data_source",
    description: "dataset inventory + lineage",
    status: "connected",
    scope: "read"
  },
  // tool
  {
    id: "salesforce",
    name: "Salesforce CRM",
    kind: "tool",
    description: "counterparty owner + opportunity status",
    status: "connected",
    scope: "read: Account, Opportunity"
  },
  {
    id: "docusign",
    name: "DocuSign",
    kind: "tool",
    description: "executed agreements + DPA archive",
    status: "connected",
    scope: "read: envelopes"
  },
  {
    id: "internal-docs",
    name: "internal docs search",
    kind: "tool",
    description: "RAG over confluence + drive",
    status: "connected",
    scope: "read"
  },
  // messaging
  {
    id: "slack",
    name: "Slack",
    kind: "messaging",
    description: "approval requests + escalations",
    status: "connected"
  },
  {
    id: "email",
    name: "email",
    kind: "messaging",
    description: "stakeholder updates",
    status: "connected"
  },
  // identity
  {
    id: "okta",
    name: "Okta",
    kind: "identity",
    description: "principal identity + SSO",
    status: "connected"
  }
];

const KIND_ORDER: AgentConnection["kind"][] = ["data_source", "tool", "messaging", "identity"];
const KIND_LABEL: Record<AgentConnection["kind"], string> = {
  data_source: "DATA SOURCES",
  tool: "TOOLS",
  messaging: "MESSAGING",
  identity: "IDENTITY"
};

export function StepConnections({ state, setState }: Props) {
  const toggle = (c: AgentConnection) => {
    setState((s) => {
      const has = s.connections.some((x) => x.id === c.id);
      return {
        ...s,
        connections: has ? s.connections.filter((x) => x.id !== c.id) : [...s.connections, c]
      };
    });
  };

  const selectedCount = state.connections.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: "var(--fg-1)", fontWeight: 500 }}>
            Wire this agent into the systems it needs.
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: "var(--fg-4)" }}>
            Optional. Pick from connected providers.
          </div>
        </div>
        <div
          aria-live="polite"
          style={{ fontSize: 11, color: "var(--fg-4)" }}
        >
          {selectedCount === 0
            ? "none selected"
            : `${selectedCount} selected`}
        </div>
      </div>

      <div
        style={{
          background: "var(--surface-0)",
          border: "1px solid var(--surface-2)",
          borderRadius: "var(--r-card)",
          overflow: "hidden"
        }}
      >
        {KIND_ORDER.map((kind, gi) => {
          const items = CATALOG.filter((c) => c.kind === kind);
          if (items.length === 0) return null;
          const isLastGroup = gi === KIND_ORDER.length - 1;
          return (
            <div
              key={kind}
              role="group"
              aria-label={KIND_LABEL[kind]}
              style={{
                borderBottom: isLastGroup ? "none" : "1px solid var(--surface-2)"
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--fg-5)",
                  letterSpacing: "0.06em",
                  padding: "10px 16px 4px"
                }}
              >
                {KIND_LABEL[kind]}
              </div>
              {items.map((c, i) => {
                const checked = state.connections.some((x) => x.id === c.id);
                const isLast = i === items.length - 1;
                return (
                  <label
                    key={c.id}
                    onMouseEnter={(e) => {
                      if (!checked) e.currentTarget.style.background = "var(--surface-1)";
                    }}
                    onMouseLeave={(e) => {
                      if (!checked) e.currentTarget.style.background = "transparent";
                    }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "18px minmax(0, 1fr) auto",
                      gap: 12,
                      alignItems: "center",
                      padding: "10px 16px",
                      borderBottom: isLast ? "none" : "1px solid var(--border-row, var(--surface-2))",
                      cursor: "pointer",
                      transition: "background 120ms ease",
                      background: checked ? "var(--accent-soft)" : "transparent",
                      boxShadow: checked ? "inset 3px 0 0 var(--accent)" : "none"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(c)}
                      style={{ display: "none" }}
                    />
                    <span
                      aria-hidden
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: checked ? "1px solid var(--accent)" : "1px solid var(--surface-3)",
                        background: checked ? "var(--accent)" : "var(--surface-0)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#1a0e08",
                        fontSize: 11,
                        fontWeight: 700,
                        lineHeight: 1
                      }}
                    >
                      {checked ? "✓" : ""}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--fg-1)",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {c.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--fg-5)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {c.description}
                      </div>
                    </div>
                    {c.scope ? (
                      <span
                        className="mono"
                        style={{ fontSize: 10, color: "var(--fg-4)", textAlign: "right" }}
                      >
                        {c.scope}
                      </span>
                    ) : (
                      <span />
                    )}
                  </label>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
