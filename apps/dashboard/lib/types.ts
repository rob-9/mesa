// Lifecycle phase. Orthogonal to flagged-state.
export type Stage = "offer" | "scope" | "amendment" | "signoff";

// All commitment types currently in /schemas/commitments/{core,datasharing}.
// v1 rendering is uniform across all types.
export type CommitmentType =
  | "offer"
  | "counter"
  | "amendment"
  | "approval"
  | "signoff"
  | "participant_joined"
  | "scope_clause"
  | "license_terms"
  | "opt_out_delta"
  | "usage_restriction"
  | "dpa_reference";

// 'pending' = blocked on a decision (human OR an internal agent).
// The Action row that surfaces in the queue carries the discriminator.
export type CommitmentStatus = "accepted" | "pending" | "flagged" | "rejected";

export interface Turn {
  id: number;
  speaker: string;
  content: string;
  timestamp: string; // ISO-8601
}

export interface Commitment {
  id: string;
  type: CommitmentType;
  summary: string;
  derivedFromTurns: number[];
  status: CommitmentStatus;
  createdAt: string; // ISO-8601
  // Other commitments this one relates to (amends, counters, finalizes).
  // Drives the edges in the commitment graph view.
  references?: string[];
}

export interface WaitingOn {
  party: "counterparty" | "you" | "agent";
  agent?: string; // when party = 'agent'
}

export interface Deliberation {
  id: string;
  title: string;
  counterparty: string;
  stage: Stage;
  flagged: boolean;
  waitingOn: WaitingOn;
  commitmentCount: number;
  lastActivity: string; // ISO-8601
  // One-line summary of the latest meaningful commitment. Renders as the
  // second line in the deliberations table rows.
  latestSummary: string;
}

export interface Action {
  id: string;
  kind: "human_signoff" | "agent_pending";
  agent?: string;
  commitment: Commitment;
  deliberationId: string;
  deliberationTitle: string;
  counterparty: string;
}

export interface DashboardData {
  counts: {
    active: number;
    awaitingAction: number;
    signed24h: number;
    flagged: number;
  };
  deliberations: Deliberation[];
  actions: Action[];
}

export interface DeliberationDetail {
  deliberation: Deliberation;
  turns: Turn[];
  commitments: Commitment[];
}

// ─── Overview screen ───────────────────────────────────────────────────────

export interface AgentStatus {
  id: string;
  name: string;        // 'lab-buyer-agent', 'legal-bot', ...
  role: string;        // 'data buyer', 'legal review', ...
  state: "negotiating" | "idle" | "blocked";
  deliberationId?: string;
  deliberationTitle?: string;
  lastActivity: string; // ISO-8601
}

export interface RecentActivity {
  id: string;
  commitmentType: CommitmentType;
  summary: string;
  deliberationId: string;
  deliberationTitle: string;
  counterparty: string;
  timestamp: string; // ISO-8601
}

export interface IntegrationStatus {
  id: string;
  name: string;       // 'Salesforce', 'Slack', ...
  description: string;
  connected: boolean;
}

export interface OverviewData {
  stats: {
    activeDeliberations: number;
    awaitingAction: number;
    medianAge: string;       // pre-formatted median age of open deliberations, e.g. "4.1h"
    autoResolved: string;    // share resolved without human review, e.g. "89%"
    flagged: number;
    deployedAgents: number;
  };
  agents: AgentStatus[];
  recent: RecentActivity[];
  actions: Action[];
  totalActions: number;
  integrations: IntegrationStatus[];
}

// ─── Agents detail ─────────────────────────────────────────────────────────

// What internal system or tool the agent has access to.
// `kind` drives icon + section grouping in the connections card.
export interface AgentConnection {
  id: string;
  name: string;          // 'Salesforce', 'company-knowledge-graph', 'pricing-db', ...
  kind: "data_source" | "tool" | "messaging" | "identity";
  description: string;   // one-line: what the agent uses this for
  status: "connected" | "degraded" | "disconnected";
  scope?: string;        // e.g. "read: Account, Opportunity"
}

// One row in the policies card. Numeric or boolean guardrails.
export interface AgentPolicy {
  id: string;
  label: string;         // 'Spend cap (per deliberation)'
  value: string;         // pre-formatted: '$250,000', '4 hours', 'requires legal'
  rationale?: string;    // one-line: why this exists
}

// One row in the activity card. Mirrors RecentActivity but scoped to agent.
export interface AgentActivityItem {
  id: string;
  commitmentType: CommitmentType;
  summary: string;
  deliberationId: string;
  deliberationTitle: string;
  counterparty: string;
  timestamp: string; // ISO-8601
}

// Why the agent produced one specific commitment. Keyed by AgentActivityItem.id.
export interface AgentReasoning {
  activityId: string;        // matches AgentActivityItem.id
  contextPulled: string[];   // sources / facts the agent retrieved before deciding
  ruleApplied: string;       // the policy or heuristic that bound the decision
  decision: string;          // one-paragraph rationale for the final value
}

export interface AgentConfig {
  model: string;         // 'claude-opus-4-7', 'gpt-5-pro', ...
  persona: string;       // short system-prompt synopsis
  capabilities: CommitmentType[]; // commitment types this agent is permitted to emit
  owner: string;         // 'rj@summer.dev'
  deployedAt: string;    // ISO-8601
}

export interface AgentDetail extends AgentStatus {
  config: AgentConfig;
  connections: AgentConnection[];
  policies: AgentPolicy[];
  activity: AgentActivityItem[];
  reasoning: AgentReasoning[];
}
