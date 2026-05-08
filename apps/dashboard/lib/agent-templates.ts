import { getAgentTemplates } from "./agent-fixtures";
import type { WizardState } from "@/components/deploy/types";
import type { AgentDetail } from "./types";

export function listAgentTemplates(): AgentDetail[] {
  return getAgentTemplates();
}

export function findAgentTemplate(id: string): AgentDetail | null {
  return getAgentTemplates().find((a) => a.id === id) ?? null;
}

export function templateToWizardState(template: AgentDetail): WizardState {
  return {
    name: `${template.name}-copy`,
    role: template.role,
    model: template.config.model,
    persona: template.config.persona,
    owner: template.config.owner,
    capabilities: [...template.config.capabilities],
    connections: template.connections.map((c) => ({ ...c })),
    policies: template.policies.map((p) => ({ ...p }))
  };
}
