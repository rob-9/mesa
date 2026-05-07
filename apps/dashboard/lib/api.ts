import { appendAgent, fixtureAgent, fixtureAgents } from "./agent-fixtures";
import {
  fixtureCounterparties,
  fixtureCounterparty,
  fixtureCounterpartyRollups,
  type CounterpartyRollup
} from "./counterparty-fixtures";
import { fixtureDashboard, fixtureDeliberation } from "./fixtures";
import { fixtureOverview } from "./overview-fixtures";
import { fixturePolicies } from "./policy-fixtures";
import { fixtureAuditEvents } from "./audit-fixtures";
import { fixtureOrgSettings } from "./settings-fixtures";
import { fixtureAnalytics } from "./analytics-fixtures";
import type {
  AgentConnection,
  AgentDetail,
  AgentPolicy,
  AnalyticsData,
  AuditEvent,
  CommitmentType,
  Counterparty,
  DashboardData,
  DeliberationDetail,
  OrgSettings,
  OverviewData,
  Policy
} from "./types";

// v1 reads from local fixtures. The eventual fastapi swap is mechanical:
// replace the body of each function with a `fetch()` against the real endpoint.

export async function getOverview(): Promise<OverviewData> {
  return fixtureOverview();
}

export async function getDashboard(): Promise<DashboardData> {
  return fixtureDashboard();
}

export async function getDeliberation(id: string): Promise<DeliberationDetail | null> {
  return fixtureDeliberation(id);
}

export async function getAgents(): Promise<AgentDetail[]> {
  return fixtureAgents();
}

export async function getAgent(id: string): Promise<AgentDetail | null> {
  return fixtureAgent(id);
}

export async function getCounterparties(): Promise<Counterparty[]> {
  return fixtureCounterparties();
}

export async function getCounterparty(slug: string): Promise<Counterparty | null> {
  return fixtureCounterparty(slug);
}

export async function getCounterpartyRollups(): Promise<Record<string, CounterpartyRollup>> {
  return fixtureCounterpartyRollups();
}

export async function getPolicies(): Promise<Policy[]> {
  return fixturePolicies();
}

export async function getAuditEvents(): Promise<AuditEvent[]> {
  return fixtureAuditEvents();
}

export async function getOrgSettings(): Promise<OrgSettings> {
  return fixtureOrgSettings();
}

export async function getAnalytics(): Promise<AnalyticsData> {
  return fixtureAnalytics();
}

export interface DeployAgentInput {
  name: string;
  role: string;
  model: string;
  persona: string;
  capabilities: CommitmentType[];
  connections: AgentConnection[];
  policies: AgentPolicy[];
  owner: string;
}

export async function deployAgent(input: DeployAgentInput): Promise<AgentDetail> {
  const id = `ag-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const agent: AgentDetail = {
    id,
    name: input.name,
    role: input.role,
    state: "idle",
    lastActivity: now,
    config: {
      model: input.model,
      persona: input.persona,
      capabilities: input.capabilities,
      owner: input.owner,
      deployedAt: now
    },
    connections: input.connections,
    policies: input.policies,
    activity: [],
    reasoning: []
  };
  appendAgent(agent);
  return agent;
}
