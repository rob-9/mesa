import type { AgentConnection, AgentPolicy, CommitmentType } from "@/lib/types";

export interface WizardState {
  name: string;
  role: string;
  model: string;
  persona: string;
  owner: string;
  capabilities: CommitmentType[];
  connections: AgentConnection[];
  policies: AgentPolicy[];
}
