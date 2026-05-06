import { appendAgent, fixtureAgent, fixtureAgents } from "./agent-fixtures";
import { fixtureDashboard, fixtureDeliberation } from "./fixtures";
import { fixtureOverview } from "./overview-fixtures";
import type {
  AgentConnection,
  AgentDetail,
  AgentPolicy,
  CommitmentType,
  DashboardData,
  DeliberationDetail,
  OverviewData
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
    activity: []
  };
  appendAgent(agent);
  return agent;
}
