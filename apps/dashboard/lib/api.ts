import { fixtureAgent, fixtureAgents } from "./agent-fixtures";
import { fixtureDashboard, fixtureDeliberation } from "./fixtures";
import { fixtureOverview } from "./overview-fixtures";
import type { AgentDetail, DashboardData, DeliberationDetail, OverviewData } from "./types";

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
