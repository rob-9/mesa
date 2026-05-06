import type { AgentConnection, AgentDetail } from "./types";

export interface ScriptResult {
  reply: string;
  next?: AgentDetail; // omit to leave state unchanged
}

export interface ScriptEntry {
  test: (input: string) => boolean;
  run: (input: string, agent: AgentDetail) => ScriptResult;
}

function lower(s: string): string {
  return s.trim().toLowerCase();
}

function setPolicyValue(agent: AgentDetail, policyId: string, value: string): AgentDetail {
  return {
    ...agent,
    policies: agent.policies.map((p) => (p.id === policyId ? { ...p, value } : p))
  };
}

function addConnection(agent: AgentDetail, conn: AgentConnection): AgentDetail {
  if (agent.connections.some((c) => c.id === conn.id)) return agent;
  return { ...agent, connections: [...agent.connections, conn] };
}

// ─── catalog of side-effect-able presets ───────────────────────────────────

const SNOWFLAKE: AgentConnection = {
  id: "snowflake",
  name: "Snowflake",
  kind: "data_source",
  description: "warehouse for licensed datasets",
  status: "connected",
  scope: "read: warehouses, datasets"
};

const DOCUSIGN: AgentConnection = {
  id: "docusign",
  name: "DocuSign",
  kind: "tool",
  description: "executed agreements + DPA archive",
  status: "connected",
  scope: "read: envelopes"
};

// ─── scripts (first match wins) ────────────────────────────────────────────

export const script: ScriptEntry[] = [
  // raise / increase spend cap to $X[k]
  {
    test: (i) => /(raise|increase|set).+(spend|spending) cap/i.test(i),
    run: (input, agent) => {
      const m = input.match(/\$?\s*(\d+(?:[\.,]\d+)?)\s*(k|m)?/i);
      const valueLabel = m
        ? `$${formatMoney(m[1], m[2])}`
        : "$500,000";
      const next = setPolicyValue(agent, "p-1", valueLabel);
      return {
        reply: `Spend cap raised to ${valueLabel}. Above this still requires legal signoff.`,
        next: next.policies.some((p) => p.id === "p-1") ? next : agent
      };
    }
  },

  // give / add access to snowflake
  {
    test: (i) => /\b(snowflake)\b/i.test(i) && /(add|give|connect|grant)/i.test(i),
    run: (_input, agent) => ({
      reply: "Snowflake connected. Read scope: warehouses, datasets.",
      next: addConnection(agent, SNOWFLAKE)
    })
  },

  // add docusign
  {
    test: (i) => /\b(docusign)\b/i.test(i) && /(add|give|connect|grant)/i.test(i),
    run: (_input, agent) => ({
      reply: "DocuSign connected. Read scope: envelopes.",
      next: addConnection(agent, DOCUSIGN)
    })
  },

  // set daily cap to N
  {
    test: (i) => /(daily|per-day|day) cap/i.test(i) || /\b(cap|limit) .* (day|daily)/i.test(i),
    run: (input, agent) => {
      const m = input.match(/(\d{1,4})/);
      const n = m ? m[1] : "20";
      const next = setPolicyValue(agent, "p-4", `${n} / day`);
      return {
        reply: `Daily commitment cap set to ${n}/day.`,
        next: next.policies.some((p) => p.id === "p-4") ? next : agent
      };
    }
  },

  // catch-all
  {
    test: () => true,
    run: () => ({
      reply:
        "I can adjust capabilities, connections, and guardrails. Try: 'raise the spend cap to $500k', 'add Snowflake', or 'set daily cap to 20'."
    })
  }
];

function formatMoney(amount: string, unit?: string): string {
  const n = parseFloat(amount.replace(",", ""));
  const total = unit?.toLowerCase() === "m" ? n * 1_000_000 : unit?.toLowerCase() === "k" ? n * 1_000 : n;
  return total.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function runScript(input: string, agent: AgentDetail): ScriptResult {
  const entry = script.find((s) => s.test(lower(input)));
  return entry ? entry.run(input, agent) : { reply: "" };
}
