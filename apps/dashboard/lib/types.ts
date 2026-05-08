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

export interface HitlGate {
  afterTurn: number;          // pause once this turn id has been revealed
  policyBound: string;        // short label, e.g. "Retraction SLA ceiling: 30 days"
  prompt: string;             // body shown in the banner
  commitmentRef?: string;     // optional commitment id to cross-link
}

// What the originating deliberation agent (e.g. lab-buyer-agent) hands off
// once the deal is locked in. Two flavors: agent2agent fan-out for the ops
// work (compliance-agent owns the SLA timers, billing-agent owns the ACH),
// and a human_signoff for the principal who has to actually sign the deal.
export interface PostSignoffTask {
  id: string;
  kind: "agent2agent" | "human_signoff";
  agent?: string;             // when kind=agent2agent, the receiving agent id/name
  deliverable: string;        // one-line description of what's being handed off
  derivedFromCommitment: string; // commitment id this handoff operationalizes
}

export interface DeliberationDetail {
  deliberation: Deliberation;
  turns: Turn[];
  commitments: Commitment[];
  hitlGate?: HitlGate;
  postSignoffTasks?: PostSignoffTask[];
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

// ─── Counterparties ────────────────────────────────────────────────────────

export type TrustTier = "verified" | "standard" | "watchlist";

export interface CounterpartyPrincipal {
  name: string;            // 'M. Sato (legal)', ...
  role?: string;           // 'legal', 'commercial', ...
  keyFingerprint: string;  // ed25519:abcd…
}

// Agents the counterparty has connected on their side. Used by the
// post-deploy "request to chat" handshake to populate the agent dropdown.
export interface CounterpartyAgent {
  id: string;              // 'publisher-co/lex'
  name: string;            // 'Lex'
  role: string;            // 'legal counsel'
}

export interface Counterparty {
  slug: string;            // 'publisher-co' — matches Deliberation.counterparty
  name: string;            // 'Publisher Co.'
  domain: string;          // 'publisher.example'
  trustTier: TrustTier;
  principals: CounterpartyPrincipal[];
  representativeAgents: CounterpartyAgent[];
  schemas: string[];       // vertical-pack ids in use
  firstDeliberationAt: string; // ISO
  notes?: string;
}

// ─── Policies ──────────────────────────────────────────────────────────────

export type PolicyAction = "flag" | "block" | "route";

export type PolicyScope =
  | { kind: "global" }
  | { kind: "agent"; agentId: string; agentName: string }
  | { kind: "counterparty"; counterpartySlug: string; counterpartyName: string };

export interface Policy {
  id: string;
  name: string;
  scope: PolicyScope;
  condition: string;       // human-readable: 'term_months > 24'
  action: PolicyAction;
  routeTo?: string;        // when action = 'route'
  hits30d: number;
  enabled: boolean;
}

// ─── Audit log ─────────────────────────────────────────────────────────────

export type AuditEventKind =
  | "transcript_turn"
  | "commitment_signed"
  | "policy_fired"
  | "agent_deployed"
  | "principal_added";

export interface AuditEvent {
  id: string;              // ULID-ish
  ts: string;              // ISO
  kind: AuditEventKind;
  actor: string;           // principal or agent id
  target: string;          // deliberation id, commitment id, etc.
  hash: string;            // sha256 prefix
  prevHash: string;        // chain pointer
  summary: string;
  payload?: Record<string, unknown>;
}

// ─── Settings / org ────────────────────────────────────────────────────────

export interface OrgPrincipal {
  id: string;
  name: string;            // 'Robert Ji'
  role: string;            // 'Ops', 'Legal', ...
  email: string;
  keyFingerprint: string;
  addedAt: string;         // ISO
}

export interface VerticalPack {
  id: string;              // 'core', 'datasharing'
  version: string;         // 'v1.2.0'
  fieldsCount: number;
  description: string;
}

export interface IntegrationTile {
  id: string;
  name: string;
  description: string;
  icon: "slack" | "mail" | "webhook";
  connected: boolean;
}

export interface OrgSettings {
  name: string;
  slug: string;
  defaultPack: string;
  principals: OrgPrincipal[];
  packs: VerticalPack[];
  integrations: IntegrationTile[];
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export interface AnalyticsData {
  throughput14d: number[];        // resolved per day, oldest first
  autoResolveRate: string;        // pre-formatted, e.g. '89%'
  autoResolveTrend14d: number[];  // 0..1 per day
  ttrBuckets: { label: string; count: number }[]; // time-to-resolution distribution
  policyFires: { kind: string; count: number; tone: "neutral" | "accent" | "amber" }[];
}
