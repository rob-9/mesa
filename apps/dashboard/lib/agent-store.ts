import type { AgentDetail } from "./types";

// Module-level mutable list. Survives client-side navigation but resets on full reload.
// For demo purposes only — swap to a real backend before shipping anything user-facing.
let agents: AgentDetail[] = [];

export function setSeed(seed: AgentDetail[]): void {
  // Idempotent: only seeds on first call. Lets fixtures hydrate without overwriting deploys.
  if (agents.length === 0) {
    agents = [...seed];
  }
}

export function listAgents(): AgentDetail[] {
  return agents;
}

export function getAgent(id: string): AgentDetail | null {
  return agents.find((a) => a.id === id) ?? null;
}

export function addAgent(agent: AgentDetail): void {
  agents = [agent, ...agents];
}
