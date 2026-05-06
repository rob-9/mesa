import { DEMO_NOW_ISO } from "./format";
import { fixtureDashboard } from "./fixtures";
import type { AgentStatus, IntegrationStatus, OverviewData, RecentActivity } from "./types";

function ago(minutes: number): string {
  return new Date(new Date(DEMO_NOW_ISO).getTime() - minutes * 60_000).toISOString();
}

const agents: AgentStatus[] = [
  {
    id: "ag-1",
    name: "lab-buyer-agent",
    role: "data buyer",
    state: "negotiating",
    deliberationId: "training-data-q4",
    deliberationTitle: "training-data Q4 license",
    lastActivity: ago(2)
  },
  {
    id: "ag-2",
    name: "legal-bot",
    role: "contract review",
    state: "negotiating",
    deliberationId: "web-archive-opt-in",
    deliberationTitle: "web-archive opt-in",
    lastActivity: ago(11)
  },
  {
    id: "ag-3",
    name: "policy-agent",
    role: "compliance gate",
    state: "blocked",
    deliberationId: "code-corpus-license",
    deliberationTitle: "code corpus license",
    lastActivity: ago(23)
  },
  {
    id: "ag-4",
    name: "data-catalog-agent",
    role: "inventory lookup",
    state: "idle",
    lastActivity: ago(180)
  },
  {
    id: "ag-5",
    name: "pricing-agent",
    role: "rate quoting",
    state: "idle",
    lastActivity: ago(330)
  }
];

const recent: RecentActivity[] = [
  {
    id: "r-1",
    commitmentType: "scope_clause",
    summary: "Articles from 2018 onwards, English only, no opinion. 2-year non-exclusive.",
    deliberationId: "training-data-q4",
    deliberationTitle: "training-data Q4 license",
    counterparty: "publisher-co",
    timestamp: ago(2)
  },
  {
    id: "r-2",
    commitmentType: "signoff",
    summary: "Web-archive opt-in agreement signed.",
    deliberationId: "web-archive-opt-in",
    deliberationTitle: "web-archive opt-in",
    counterparty: "trinity-data",
    timestamp: ago(11)
  },
  {
    id: "r-3",
    commitmentType: "offer",
    summary: "Revenue-share proposal: 12% gross, capped at $200k/yr.",
    deliberationId: "image-corpus-rev-share",
    deliberationTitle: "image corpus rev-share",
    counterparty: "zenith",
    timestamp: ago(64)
  },
  {
    id: "r-4",
    commitmentType: "amendment",
    summary: "Translations excluded from training-data scope.",
    deliberationId: "training-data-q4",
    deliberationTitle: "training-data Q4 license",
    counterparty: "publisher-co",
    timestamp: ago(140)
  },
  {
    id: "r-5",
    commitmentType: "offer",
    summary: "Initial license proposal: github public repos, 3-year term.",
    deliberationId: "code-corpus-license",
    deliberationTitle: "code corpus license",
    counterparty: "octostack",
    timestamp: ago(181)
  }
];

const integrations: IntegrationStatus[] = [
  { id: "int-salesforce", name: "Salesforce", description: "Counterparty CRM sync", connected: true },
  { id: "int-slack", name: "Slack", description: "Action-queue notifications", connected: true },
  { id: "int-okta", name: "Okta", description: "Principal identity", connected: true },
  { id: "int-docusign", name: "DocuSign", description: "Signed agreement archive", connected: false },
  { id: "int-snowflake", name: "Snowflake", description: "Commitment data warehouse", connected: false }
];

export function fixtureOverview(): OverviewData {
  const dashboard = fixtureDashboard();
  return {
    stats: {
      activeDeliberations: dashboard.counts.active,
      awaitingAction: dashboard.counts.awaitingAction,
      medianAge: "4.1h",
      autoResolved: "89%",
      flagged: dashboard.counts.flagged,
      deployedAgents: agents.length
    },
    agents,
    recent,
    actions: dashboard.actions,
    totalActions: dashboard.actions.length,
    integrations
  };
}
