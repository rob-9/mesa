import { DEMO_NOW_ISO } from "./format";
import { fixtureDashboard } from "./fixtures";
import type {
  AgentStatus,
  IntegrationStatus,
  OverviewData,
  RecentActivity,
  RiskPulse,
  SignificantEvent,
  SystemPulse
} from "./types";

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

const events: SignificantEvent[] = [
  {
    id: "ev-1",
    kind: "deliberation_signed",
    timestamp: ago(58),
    summary: "web-archive opt-in signed by trinity-data.",
    href: "/deliberations/web-archive-opt-in"
  },
  {
    id: "ev-2",
    kind: "policy_fired",
    timestamp: ago(120),
    summary: "spend-cap policy flagged training-data Q4 ($240k).",
    href: "/policies"
  },
  {
    id: "ev-3",
    kind: "policy_fired",
    timestamp: ago(122),
    summary: "spend-cap policy flagged image-corpus rev-share ($180k).",
    href: "/policies"
  },
  {
    id: "ev-4",
    kind: "agent_deployed",
    timestamp: ago(220),
    summary: "pricing-agent deployed (v0.4.2) by rj@mesa.dev.",
    href: "/agents/ag-5"
  },
  {
    id: "ev-5",
    kind: "integration_disconnected",
    timestamp: ago(290),
    summary: "Snowflake integration disconnected — token expired.",
    href: "/settings"
  },
  {
    id: "ev-6",
    kind: "principal_added",
    timestamp: ago(60 * 24 + 90),
    summary: "Principal M. Zhao (legal) added.",
    href: "/settings"
  }
];

export function fixtureOverview(): OverviewData {
  const dashboard = fixtureDashboard();
  const now = new Date(DEMO_NOW_ISO).getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const staleOver7d = dashboard.deliberations.filter(
    (d) => now - new Date(d.lastActivity).getTime() > sevenDaysMs
  ).length;
  const policyFires24h = events.filter(
    (e) =>
      e.kind === "policy_fired" &&
      now - new Date(e.timestamp).getTime() < 24 * 60 * 60 * 1000
  ).length;
  const integrationsConnected = integrations.filter((i) => i.connected).length;
  const hasBlockedAgent = agents.some((a) => a.state === "blocked");
  const hasDisconnectedIntegration = integrationsConnected < integrations.length;
  const health: SystemPulse["health"] =
    hasBlockedAgent || hasDisconnectedIntegration ? "degraded" : "healthy";

  const pulse: SystemPulse = {
    deployedAgents: agents.length,
    integrationsConnected,
    integrationsTotal: integrations.length,
    flagged: dashboard.counts.flagged,
    policyFires24h,
    health
  };

  const risk: RiskPulse = {
    flaggedOpen: dashboard.counts.flagged,
    policyFires24h,
    staleOver7d
  };

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
    integrations,
    pulse,
    events,
    risk
  };
}
