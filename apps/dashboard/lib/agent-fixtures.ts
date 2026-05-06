import { addAgent, getAgent, listAgents, setSeed } from "./agent-store";
import { DEMO_NOW_ISO } from "./format";
import type { AgentDetail } from "./types";

function ago(minutes: number): string {
  return new Date(new Date(DEMO_NOW_ISO).getTime() - minutes * 60_000).toISOString();
}

const labBuyer: AgentDetail = {
  id: "ag-1",
  name: "lab-buyer-agent",
  role: "data buyer",
  state: "negotiating",
  deliberationId: "training-data-q4",
  deliberationTitle: "training-data Q4 license",
  lastActivity: ago(2),
  config: {
    model: "claude-opus-4-7",
    persona:
      "Procures licensed training data within budget and policy guardrails. Pushes for non-exclusive terms and short renewal windows.",
    capabilities: ["offer", "counter", "scope_clause", "license_terms", "amendment"],
    owner: "rj@summer.dev",
    deployedAt: "2026-04-12T00:00:00Z"
  },
  connections: [
    {
      id: "c-1",
      name: "company-knowledge-graph",
      kind: "data_source",
      description: "looks up prior license terms and counterparty history",
      status: "connected",
      scope: "read: licenses, counterparties"
    },
    {
      id: "c-2",
      name: "pricing-db",
      kind: "data_source",
      description: "compares quoted rates against internal benchmarks",
      status: "connected",
      scope: "read: rate cards"
    },
    {
      id: "c-3",
      name: "Salesforce CRM",
      kind: "tool",
      description: "pulls counterparty owner + contract status",
      status: "connected",
      scope: "read: Account, Opportunity"
    },
    {
      id: "c-4",
      name: "Slack",
      kind: "messaging",
      description: "posts approval requests to #data-licensing",
      status: "connected"
    },
    {
      id: "c-5",
      name: "Okta",
      kind: "identity",
      description: "authenticates as principal lab.buyer@summer.dev",
      status: "connected"
    }
  ],
  policies: [
    {
      id: "p-1",
      label: "Spend cap (per deliberation)",
      value: "$250,000",
      rationale: "above this requires legal signoff"
    },
    {
      id: "p-2",
      label: "Signoff threshold",
      value: "human required",
      rationale: "all signoffs route to legal-bot then human"
    },
    {
      id: "p-3",
      label: "Allowed counterparties",
      value: "publishers, news, code corpora",
      rationale: "scope of Q4 OKR"
    },
    {
      id: "p-4",
      label: "Daily commitment cap",
      value: "12 / day",
      rationale: "throttle to keep audit reviewable"
    }
  ],
  activity: [
    {
      id: "a-1",
      commitmentType: "scope_clause",
      summary: "Defined scope: articles from 2018, English, no opinion, 2-year non-exclusive.",
      deliberationId: "training-data-q4",
      deliberationTitle: "training-data Q4 license",
      counterparty: "publisher-co",
      timestamp: ago(2)
    },
    {
      id: "a-2",
      commitmentType: "amendment",
      summary: "Excluded translations from scope.",
      deliberationId: "training-data-q4",
      deliberationTitle: "training-data Q4 license",
      counterparty: "publisher-co",
      timestamp: ago(140)
    },
    {
      id: "a-3",
      commitmentType: "offer",
      summary: "Proposed $180k flat, 12-month term.",
      deliberationId: "training-data-q4",
      deliberationTitle: "training-data Q4 license",
      counterparty: "publisher-co",
      timestamp: ago(420)
    }
  ]
};

const legalBot: AgentDetail = {
  id: "ag-2",
  name: "legal-bot",
  role: "contract review",
  state: "negotiating",
  deliberationId: "web-archive-opt-in",
  deliberationTitle: "web-archive opt-in",
  lastActivity: ago(11),
  config: {
    model: "claude-opus-4-7",
    persona:
      "Reviews counterparty paper for missing DPAs, indemnity gaps, and non-standard liability caps. Blocks signoff until clauses pass checklist.",
    capabilities: ["dpa_reference", "approval", "amendment"],
    owner: "rj@summer.dev",
    deployedAt: "2026-03-21T00:00:00Z"
  },
  connections: [
    {
      id: "c-1",
      name: "internal-contracts-repo",
      kind: "data_source",
      description: "pulls precedent paper to compare clause language",
      status: "connected",
      scope: "read: executed agreements"
    },
    {
      id: "c-2",
      name: "DocuSign",
      kind: "tool",
      description: "fetches executed DPAs and verifies signatures",
      status: "connected",
      scope: "read: envelopes"
    },
    {
      id: "c-3",
      name: "Slack",
      kind: "messaging",
      description: "escalates blocking issues to #legal-review",
      status: "connected"
    },
    {
      id: "c-4",
      name: "Okta",
      kind: "identity",
      description: "authenticates as principal legal.bot@summer.dev",
      status: "connected"
    }
  ],
  policies: [
    {
      id: "p-1",
      label: "DPA gate",
      value: "blocks signoff",
      rationale: "blocks any signoff missing executed DPA"
    },
    {
      id: "p-2",
      label: "Indemnity floor",
      value: "$1,000,000",
      rationale: "standard mutual indemnity baseline"
    },
    {
      id: "p-3",
      label: "Liability cap",
      value: "12mo fees",
      rationale: "rejects unbounded liability terms"
    },
    {
      id: "p-4",
      label: "Escalation",
      value: "human counsel",
      rationale: "non-standard clauses route to general counsel"
    }
  ],
  activity: [
    {
      id: "a-1",
      commitmentType: "approval",
      summary: "Verified DPA v2.1 for trinity-data and cleared signoff.",
      deliberationId: "web-archive-opt-in",
      deliberationTitle: "web-archive opt-in",
      counterparty: "trinity-data",
      timestamp: ago(11)
    },
    {
      id: "a-2",
      commitmentType: "dpa_reference",
      summary: "Pinned DPA #DPA-2026-041 to web-archive opt-in.",
      deliberationId: "web-archive-opt-in",
      deliberationTitle: "web-archive opt-in",
      counterparty: "trinity-data",
      timestamp: ago(45)
    },
    {
      id: "a-3",
      commitmentType: "amendment",
      summary: "Tightened indemnity language to mutual carve-out.",
      deliberationId: "image-corpus-rev-share",
      deliberationTitle: "image corpus rev-share",
      counterparty: "zenith",
      timestamp: ago(210)
    },
    {
      id: "a-4",
      commitmentType: "approval",
      summary: "Approved liability cap at 12mo fees on octostack draft.",
      deliberationId: "code-corpus-license",
      deliberationTitle: "code corpus license",
      counterparty: "octostack",
      timestamp: ago(640)
    }
  ]
};

const policyAgent: AgentDetail = {
  id: "ag-3",
  name: "policy-agent",
  role: "compliance gate",
  state: "blocked",
  deliberationId: "code-corpus-license",
  deliberationTitle: "code corpus license",
  lastActivity: ago(23),
  config: {
    model: "claude-opus-4-7",
    persona:
      "Evaluates each commitment against the active policy bundle. Hard-rejects deliberations with EU subjects unless DPA v2.1+ is attached.",
    capabilities: ["approval", "amendment"],
    owner: "rj@summer.dev",
    deployedAt: "2026-02-08T00:00:00Z"
  },
  connections: [
    {
      id: "c-1",
      name: "OPA policy engine",
      kind: "tool",
      description: "evaluates commitments against active rule bundle",
      status: "connected",
      scope: "eval: bundle@v2.1"
    },
    {
      id: "c-2",
      name: "compliance-rules-repo",
      kind: "data_source",
      description: "loads versioned rule definitions",
      status: "connected",
      scope: "read: bundles"
    },
    {
      id: "c-3",
      name: "company-knowledge-graph",
      kind: "data_source",
      description: "checks counterparty jurisdiction + subject categories",
      status: "degraded",
      scope: "read: counterparties"
    },
    {
      id: "c-4",
      name: "Slack",
      kind: "messaging",
      description: "notifies #compliance on hard-blocks",
      status: "connected"
    },
    {
      id: "c-5",
      name: "Okta",
      kind: "identity",
      description: "authenticates as principal policy.agent@summer.dev",
      status: "connected"
    }
  ],
  policies: [
    {
      id: "p-1",
      label: "EU subjects",
      value: "DPA v2.1+ required",
      rationale: "rejects deliberations with EU subjects without DPA v2.1+"
    },
    {
      id: "p-2",
      label: "Rule bundle",
      value: "bundle@v2.1",
      rationale: "pinned to current published bundle"
    },
    {
      id: "p-3",
      label: "Override path",
      value: "GC + CISO",
      rationale: "two-key override for blocked deliberations"
    }
  ],
  activity: [
    {
      id: "a-1",
      commitmentType: "amendment",
      summary: "Blocked octostack: DPA references v2.0, requires v2.1 upgrade.",
      deliberationId: "code-corpus-license",
      deliberationTitle: "code corpus license",
      counterparty: "octostack",
      timestamp: ago(23)
    },
    {
      id: "a-2",
      commitmentType: "approval",
      summary: "Approved zenith image corpus against bundle@v2.1.",
      deliberationId: "image-corpus-rev-share",
      deliberationTitle: "image corpus rev-share",
      counterparty: "zenith",
      timestamp: ago(310)
    },
    {
      id: "a-3",
      commitmentType: "approval",
      summary: "Approved trinity-data web-archive opt-in (US-only subjects).",
      deliberationId: "web-archive-opt-in",
      deliberationTitle: "web-archive opt-in",
      counterparty: "trinity-data",
      timestamp: ago(720)
    }
  ]
};

const dataCatalogAgent: AgentDetail = {
  id: "ag-4",
  name: "data-catalog-agent",
  role: "inventory lookup",
  state: "idle",
  lastActivity: ago(180),
  config: {
    model: "claude-opus-4-7",
    persona:
      "Resolves ambiguous dataset references to canonical catalog entries and surfaces lineage when scope clauses are drafted.",
    capabilities: ["scope_clause"],
    owner: "rj@summer.dev",
    deployedAt: "2026-01-30T00:00:00Z"
  },
  connections: [
    {
      id: "c-1",
      name: "data-catalog",
      kind: "data_source",
      description: "resolves dataset names to canonical ids",
      status: "connected",
      scope: "read: datasets"
    },
    {
      id: "c-2",
      name: "lineage-graph",
      kind: "data_source",
      description: "traces upstream sources of derived datasets",
      status: "connected",
      scope: "read: lineage"
    },
    {
      id: "c-3",
      name: "Slack",
      kind: "messaging",
      description: "responds to /catalog lookups in #data",
      status: "connected"
    },
    {
      id: "c-4",
      name: "Okta",
      kind: "identity",
      description: "authenticates as principal catalog.agent@summer.dev",
      status: "connected"
    }
  ],
  policies: [
    {
      id: "p-1",
      label: "Read-only",
      value: "true",
      rationale: "agent never mutates catalog state"
    },
    {
      id: "p-2",
      label: "Lookup latency budget",
      value: "2s",
      rationale: "fails open if catalog is slow"
    },
    {
      id: "p-3",
      label: "Sensitive datasets",
      value: "tag: pii blocked",
      rationale: "never surfaces pii-tagged entries to other agents"
    }
  ],
  activity: [
    {
      id: "a-1",
      commitmentType: "scope_clause",
      summary: "Resolved 'github public repos' to canonical dataset gh-public-2024.",
      deliberationId: "code-corpus-license",
      deliberationTitle: "code corpus license",
      counterparty: "octostack",
      timestamp: ago(180)
    },
    {
      id: "a-2",
      commitmentType: "scope_clause",
      summary: "Traced lineage: image-corpus-v3 derives from 4 upstream sets.",
      deliberationId: "image-corpus-rev-share",
      deliberationTitle: "image corpus rev-share",
      counterparty: "zenith",
      timestamp: ago(880)
    }
  ]
};

const pricingAgent: AgentDetail = {
  id: "ag-5",
  name: "pricing-agent",
  role: "rate quoting",
  state: "idle",
  lastActivity: ago(330),
  config: {
    model: "claude-opus-4-7",
    persona:
      "Quotes rates against internal rate cards and historical comparables. Suggests counters when offers fall outside the comparable band.",
    capabilities: ["offer", "counter"],
    owner: "rj@summer.dev",
    deployedAt: "2026-02-14T00:00:00Z"
  },
  connections: [
    {
      id: "c-1",
      name: "pricing-db",
      kind: "data_source",
      description: "loads current rate cards by dataset class",
      status: "connected",
      scope: "read: rate cards"
    },
    {
      id: "c-2",
      name: "historical-deals-warehouse",
      kind: "data_source",
      description: "pulls comparables for similar prior agreements",
      status: "connected",
      scope: "read: closed deals"
    },
    {
      id: "c-3",
      name: "Slack",
      kind: "messaging",
      description: "drops quote summaries into #pricing",
      status: "connected"
    },
    {
      id: "c-4",
      name: "Okta",
      kind: "identity",
      description: "authenticates as principal pricing.agent@summer.dev",
      status: "connected"
    }
  ],
  policies: [
    {
      id: "p-1",
      label: "Counter band",
      value: "+/- 15% comparable",
      rationale: "auto-counters offers outside this band"
    },
    {
      id: "p-2",
      label: "Quote ceiling",
      value: "$500,000",
      rationale: "above this requires human quote review"
    },
    {
      id: "p-3",
      label: "Discount floor",
      value: "10%",
      rationale: "never quotes below floor without override"
    }
  ],
  activity: [
    {
      id: "a-1",
      commitmentType: "offer",
      summary: "Proposed revenue-share: 12% gross, capped at $200k/yr.",
      deliberationId: "image-corpus-rev-share",
      deliberationTitle: "image corpus rev-share",
      counterparty: "zenith",
      timestamp: ago(330)
    },
    {
      id: "a-2",
      commitmentType: "counter",
      summary: "Countered with $220k flat, 18mo term (vs $180k flat, 24mo).",
      deliberationId: "training-data-q4",
      deliberationTitle: "training-data Q4 license",
      counterparty: "publisher-co",
      timestamp: ago(540)
    },
    {
      id: "a-3",
      commitmentType: "offer",
      summary: "Proposed license on github public repos, 3-year term.",
      deliberationId: "code-corpus-license",
      deliberationTitle: "code corpus license",
      counterparty: "octostack",
      timestamp: ago(820)
    }
  ]
};

const seed: AgentDetail[] = [labBuyer, legalBot, policyAgent, dataCatalogAgent, pricingAgent];
setSeed(seed);

export function fixtureAgents(): AgentDetail[] {
  return listAgents();
}

export function fixtureAgent(id: string): AgentDetail | null {
  return getAgent(id);
}

export function appendAgent(agent: AgentDetail): void {
  addAgent(agent);
}
