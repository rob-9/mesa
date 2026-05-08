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
    owner: "rj@mesa.dev",
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
      description: "authenticates as principal lab.buyer@mesa.dev",
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
  ],
  reasoning: [
    {
      activityId: "a-1",
      contextPulled: [
        "company-knowledge-graph: 4 prior publisher-co licenses, all English-only",
        "pricing-db: archive material >5y old prices at 0.4× current",
        "legal precedent: opinion content carries 3× indemnity exposure"
      ],
      ruleApplied: "spend cap $250k forces narrow scope; default to non-exclusive when counterparty has no exclusivity history",
      decision:
        "Restricted to articles from 2018+ to avoid the archive premium and keep volume inside the spend cap. English-only matches downstream training set. No-opinion clause keeps indemnity exposure inside the standard cap. 2-year non-exclusive aligns with the Q4 OKR window."
    },
    {
      activityId: "a-2",
      contextPulled: [
        "publisher-co rights table: translation rights licensed separately to translation-co",
        "pricing-db: ambiguous-rights deals carry +30% legal review cost"
      ],
      ruleApplied: "rights-clarity rule: do not pay for rights the counterparty cannot cleanly grant",
      decision:
        "Pulling translations out drops the quote by ~$40k and removes a downstream dispute risk. Counterparty agreed inside one round."
    },
    {
      activityId: "a-3",
      contextPulled: [
        "pricing-db median comparable: $200k flat for similar non-exclusive scope",
        "historical-deals-warehouse: publisher-co last 3 deals closed at 88-94% of median",
        "Salesforce CRM: opportunity owner has soft target $175k"
      ],
      ruleApplied: "non-exclusive band: anchor at median minus 10%; never below opportunity-owner soft target unless override",
      decision:
        "$180k is 90% of the median and 3% above the soft target. 12-month term matches the budget cycle and gives room to renegotiate before the next planning round."
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
    owner: "rj@mesa.dev",
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
      description: "authenticates as principal legal.bot@mesa.dev",
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
  ],
  reasoning: [
    {
      activityId: "a-1",
      contextPulled: [
        "DocuSign: trinity-data DPA v2.1 executed 2026-04-02, signatures verified",
        "internal-contracts-repo: trinity-data uses our standard mutual-indemnity template",
        "OPA: bundle@v2.1 evaluation = pass"
      ],
      ruleApplied: "DPA gate: signoff blocked unless an executed DPA matching active bundle is on file",
      decision:
        "All three checks cleared. Cleared signoff for the web-archive opt-in deliberation."
    },
    {
      activityId: "a-2",
      contextPulled: [
        "DocuSign envelope #DPA-2026-041 (executed 2026-04-02)",
        "deliberation web-archive-opt-in references no DPA"
      ],
      ruleApplied: "every active deliberation must pin one DPA reference before signoff",
      decision:
        "Pinned the executed DPA to the deliberation so downstream commitments inherit its scope and version."
    },
    {
      activityId: "a-3",
      contextPulled: [
        "zenith counter-draft used unilateral indemnity (counterparty only)",
        "internal-contracts-repo: standard mutual-indemnity carve-out language v3"
      ],
      ruleApplied: "indemnity floor: refuse unilateral language; require mutual carve-out for IP and gross negligence",
      decision:
        "Replaced the unilateral clause with the standard mutual carve-out. Counterparty accepted in next round."
    },
    {
      activityId: "a-4",
      contextPulled: [
        "octostack proposed 12mo-fees liability cap",
        "internal-contracts-repo: 87% of comparable deals close at 12mo cap",
        "deliberation total fees < $200k"
      ],
      ruleApplied: "liability cap: 12mo-fees acceptable when total fees stay under $250k",
      decision:
        "12mo cap aligns with comparable practice for deals at this size. Approved without amendment."
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
    owner: "rj@mesa.dev",
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
      description: "authenticates as principal policy.agent@mesa.dev",
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
  ],
  reasoning: [
    {
      activityId: "a-1",
      contextPulled: [
        "octostack DPA reference resolved to v2.0 in compliance-rules-repo",
        "deliberation includes EU subjects (jurisdiction tag from knowledge-graph)",
        "OPA: bundle@v2.1 evaluation = fail (rule eu_subjects_require_v21)"
      ],
      ruleApplied: "EU subjects: hard-reject any commitment under DPA <v2.1",
      decision:
        "Bundle evaluation failed on the EU-subjects rule. Blocked with a structured amendment requiring DPA upgrade to v2.1; sent to #compliance and the override path."
    },
    {
      activityId: "a-2",
      contextPulled: [
        "zenith DPA v2.1 on file",
        "image-corpus jurisdiction set: US, CA, UK (no EU)",
        "OPA: bundle@v2.1 evaluation = pass"
      ],
      ruleApplied: "approve when bundle evaluation passes and DPA matches active bundle",
      decision:
        "All checks pass. Approved without amendment."
    },
    {
      activityId: "a-3",
      contextPulled: [
        "trinity-data subject set tagged US-only by knowledge-graph",
        "EU-subjects rule does not trigger",
        "OPA: bundle@v2.1 evaluation = pass"
      ],
      ruleApplied: "US-only subjects skip the v2.1 hard-gate; standard bundle check applies",
      decision:
        "Bundle passed; subjects are US-only so the EU rule does not apply. Approved."
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
    owner: "rj@mesa.dev",
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
      description: "authenticates as principal catalog.agent@mesa.dev",
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
  ],
  reasoning: [
    {
      activityId: "a-1",
      contextPulled: [
        "data-catalog: 'github public repos' fuzzy-matched 3 candidates",
        "lineage-graph: gh-public-2024 has cleanest provenance + license labels",
        "policy: pii tag absent on gh-public-2024"
      ],
      ruleApplied: "resolve ambiguous dataset names to the candidate with cleanest provenance and matching license labels",
      decision:
        "gh-public-2024 had the highest match score and clean license labels. Pinned it as the canonical reference for the scope clause."
    },
    {
      activityId: "a-2",
      contextPulled: [
        "lineage-graph: image-corpus-v3 derives from 4 upstream sets (creative-commons-imgs, museum-archive-2023, partner-photos-2024, public-domain-art)",
        "two of four upstream sets have PII tags downstream"
      ],
      ruleApplied: "surface full lineage when any upstream contains pii-tagged content",
      decision:
        "Surfaced full lineage so downstream agents can choose between the full corpus and a pii-free subset."
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
    owner: "rj@mesa.dev",
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
      description: "authenticates as principal pricing.agent@mesa.dev",
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
  ],
  reasoning: [
    {
      activityId: "a-1",
      contextPulled: [
        "pricing-db: image-corpus rates run 8-15% gross rev share",
        "historical-deals-warehouse: 3 zenith comparables capped at $200-250k/yr",
        "counter band evaluation: zenith's last opening offer was 14%"
      ],
      ruleApplied: "counter band: anchor at the comparable median; cap at the 75th-percentile annual ceiling",
      decision:
        "12% sits inside the comparable band and below counterparty's last opening. $200k cap aligns with the 75th-percentile annual figure in the warehouse."
    },
    {
      activityId: "a-2",
      contextPulled: [
        "publisher-co counter at $180k flat / 24mo",
        "pricing-db comparable median: $210k for similar 24mo deals",
        "historical-deals-warehouse: 18mo deals close ~6% above 24mo on similar rights"
      ],
      ruleApplied: "auto-counter when offer falls outside the +/- 15% comparable band",
      decision:
        "The $180k/24mo offer was 14% below median. Countered with $220k flat at 18mo to bring the deal back inside the band and recover term flexibility."
    },
    {
      activityId: "a-3",
      contextPulled: [
        "data-catalog confirmed gh-public-2024 as canonical",
        "pricing-db: code corpora rate at $0.04/MB for non-exclusive 3yr",
        "historical-deals-warehouse: octostack's last code deal closed at $0.038/MB"
      ],
      ruleApplied: "anchor at counterparty's last comparable rate when one exists",
      decision:
        "Anchored the opening offer to octostack's prior rate. 3-year term matches octostack's preferred contract length."
    }
  ]
};

const seed: AgentDetail[] = [labBuyer, legalBot, policyAgent, dataCatalogAgent, pricingAgent];
setSeed(seed);

// Returns the original seeded agents (templates), unaffected by anything deployed at runtime.
export function getAgentTemplates(): AgentDetail[] {
  return seed;
}

export function fixtureAgents(): AgentDetail[] {
  return listAgents();
}

export function fixtureAgent(id: string): AgentDetail | null {
  return getAgent(id);
}

export function appendAgent(agent: AgentDetail): void {
  addAgent(agent);
}
