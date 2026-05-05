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
