import { DEMO_NOW_ISO } from "./format";
import type {
  Action,
  Commitment,
  CommitmentStatus,
  CommitmentType,
  DashboardData,
  Deliberation,
  DeliberationDetail,
  Turn
} from "./types";

// Helper to make iso strings relative to the shared demo "now".
function ago(minutes: number): string {
  return new Date(new Date(DEMO_NOW_ISO).getTime() - minutes * 60_000).toISOString();
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo deliberation: training-data-q4 (lab ↔ publisher-co)
// ─────────────────────────────────────────────────────────────────────────────

const trainingDataQ4Turns: Turn[] = [
  { id: 1,  speaker: "lab",       content: "We're interested in licensing your news archive for training a foundation model.", timestamp: "2026-05-05T14:02:00Z" },
  { id: 2,  speaker: "publisher", content: "Open to it. What scope, term, and price are you thinking?", timestamp: "2026-05-05T14:03:00Z" },
  { id: 3,  speaker: "lab",       content: "Articles from 2018 onwards, English only, exclude opinion pieces and editorials.", timestamp: "2026-05-05T14:04:00Z" },
  { id: 4,  speaker: "publisher", content: "Acceptable. Two-year non-exclusive license, renewable.", timestamp: "2026-05-05T14:05:00Z" },
  { id: 5,  speaker: "lab",       content: "What about translated articles? Some of our target languages depend on those.", timestamp: "2026-05-05T14:07:00Z" },
  { id: 6,  speaker: "publisher", content: "Original-language only. Translations are licensed separately by the rights-holders, we can't bundle.", timestamp: "2026-05-05T14:08:00Z" },
  { id: 7,  speaker: "lab",       content: "Understood. Excluding translations from scope.", timestamp: "2026-05-05T14:09:00Z" },
  { id: 8,  speaker: "publisher", content: "Confirmed.", timestamp: "2026-05-05T14:10:00Z" },
  { id: 9,  speaker: "lab",       content: "Pricing — what's the structure?", timestamp: "2026-05-05T14:12:00Z" },
  { id: 10, speaker: "publisher", content: "$0.0008 per article, billed monthly. Roughly 1.4M articles in scope at signing, growing 3-5% per quarter.", timestamp: "2026-05-05T14:13:00Z" },
  { id: 11, speaker: "lab",       content: "That's about $1,120/month at signing. We'd propose $750/month flat for the term, plus quarterly true-up audit rights.", timestamp: "2026-05-05T14:15:00Z" },
  { id: 12, speaker: "publisher", content: "Counter: $900/month flat, audit allowed with 24-hour notice, scope of audit limited to article-count reconciliation.", timestamp: "2026-05-05T14:17:00Z" },
  { id: 13, speaker: "lab",       content: "Agreed: $900/month flat, 24-hour audit notice, count reconciliation only.", timestamp: "2026-05-05T14:18:00Z" },
  { id: 14, speaker: "lab",       content: "Opt-out — we'll honor robots.txt and per-URL X-NoArchive headers at fetch time.", timestamp: "2026-05-05T14:21:00Z" },
  { id: 15, speaker: "publisher", content: "Add a kill-switch: on retraction or legal removal request, you must purge from training data within 7 days.", timestamp: "2026-05-05T14:22:00Z" },
  { id: 16, speaker: "lab",       content: "7-day purge exceeds our retraining cadence — policy ceiling is 30 days. Counter: 14 days on formal legal removal (court order, statutory takedown), 30 days on editorial retraction. Both audit-logged.", timestamp: "2026-05-05T14:25:00Z" },
  { id: 17, speaker: "publisher", content: "Acceptable. 14-day SLA on formal legal removal, 30-day on retraction notices.", timestamp: "2026-05-05T14:26:00Z" },
  { id: 18, speaker: "lab",       content: "Confirmed and logged against §6 of our model-update policy.", timestamp: "2026-05-05T14:27:00Z" },
  { id: 19, speaker: "publisher", content: "Usage restrictions — no resale of derivative model weights, no public attribution naming publisher-co as a training source.", timestamp: "2026-05-05T14:29:00Z" },
  { id: 20, speaker: "lab",       content: "No resale, agreed. On attribution, our model cards use aggregate sourcing categories (e.g. \"licensed news corpora\") rather than per-source names — confirming that satisfies \"no naming.\"", timestamp: "2026-05-05T14:30:00Z" },
  { id: 21, speaker: "publisher", content: "Compatible. Aggregate-only language is fine.", timestamp: "2026-05-05T14:31:00Z" },
  { id: 22, speaker: "publisher", content: "Data processing — we'll reference our standard DPA, GDPR-compliant. Linking the latest version.", timestamp: "2026-05-05T14:33:00Z" },
  { id: 23, speaker: "lab",       content: "DPA reviewed and attached. No deviations from standard.", timestamp: "2026-05-05T14:35:00Z" },
  { id: 24, speaker: "lab",       content: "Compiling all terms. Sending for sign-off.", timestamp: "2026-05-05T14:37:00Z" },
  { id: 25, speaker: "publisher", content: "Standing by.", timestamp: "2026-05-05T14:38:00Z" }
];

const trainingDataQ4HitlGate = {
  afterTurn: 15,
  policyBound: "Retraction SLA ceiling: 30 days",
  prompt: "Publisher requested 7-day purge SLA on retraction — exceeds the agent's policy ceiling. Authorize the agent to negotiate counter-terms, or hold for review.",
  commitmentRef: "c-tdq4-6"
};

const trainingDataQ4PostSignoff = [
  {
    id: "ps-tdq4-1",
    kind: "agent2agent" as const,
    agent: "compliance-agent",
    deliverable:
      "stand up 14-day formal-removal + 30-day retraction timers; register publisher-co webhook; emit purge audit log",
    derivedFromCommitment: "c-tdq4-6"
  },
  {
    id: "ps-tdq4-2",
    kind: "agent2agent" as const,
    agent: "billing-agent",
    deliverable:
      "schedule $900/mo ACH to publisher-co; quarterly count reconciliation; 24h audit-notice channel",
    derivedFromCommitment: "c-tdq4-5"
  },
  {
    id: "ps-tdq4-3",
    kind: "human_signoff" as const,
    deliverable: "principal sign-off on final agreement (binds the lab to all terms above)",
    derivedFromCommitment: "c-tdq4-9"
  }
];

const trainingDataQ4Commitments: Commitment[] = [
  {
    id: "c-tdq4-1",
    type: "offer",
    summary: "Lab proposes licensing publisher's news archive for foundation model training.",
    derivedFromTurns: [1, 2],
    status: "accepted",
    createdAt: "2026-05-05T14:03:30Z"
  },
  {
    id: "c-tdq4-2",
    type: "scope_clause",
    summary: "Articles 2018+, English only, no opinion or editorials. 2-year non-exclusive renewable.",
    derivedFromTurns: [3, 4],
    status: "accepted",
    createdAt: "2026-05-05T14:05:30Z",
    references: ["c-tdq4-1"]
  },
  {
    id: "c-tdq4-3",
    type: "amendment",
    summary: "Translated articles excluded from scope (rights-holder bundling restriction).",
    derivedFromTurns: [5, 6, 7, 8],
    status: "accepted",
    createdAt: "2026-05-05T14:10:30Z",
    references: ["c-tdq4-2"]
  },
  {
    id: "c-tdq4-4",
    type: "counter",
    summary: "Publisher counters lab's $750/mo flat with $900/mo + 24-hour audit notice.",
    derivedFromTurns: [11, 12],
    status: "accepted",
    createdAt: "2026-05-05T14:17:30Z",
    references: ["c-tdq4-1"]
  },
  {
    id: "c-tdq4-5",
    type: "license_terms",
    summary: "$900/month flat fee, 24-hour audit notice, count-reconciliation only.",
    derivedFromTurns: [12, 13],
    status: "accepted",
    createdAt: "2026-05-05T14:18:30Z",
    references: ["c-tdq4-4"]
  },
  {
    id: "c-tdq4-6",
    type: "opt_out_delta",
    summary: "Honors robots.txt and X-NoArchive at fetch; 14-day purge on formal legal removal, 30-day on editorial retraction (audit-logged).",
    derivedFromTurns: [14, 15, 16, 17, 18],
    status: "accepted",
    createdAt: "2026-05-05T14:27:30Z",
    references: ["c-tdq4-2"]
  },
  {
    id: "c-tdq4-7",
    type: "usage_restriction",
    summary: "No resale of derivative model weights; aggregate-only sourcing language on model card (no publisher-co naming).",
    derivedFromTurns: [19, 20, 21],
    status: "accepted",
    createdAt: "2026-05-05T14:31:30Z",
    references: ["c-tdq4-2", "c-tdq4-5"]
  },
  {
    id: "c-tdq4-8",
    type: "dpa_reference",
    summary: "Standard publisher-co GDPR-compliant DPA attached without modification.",
    derivedFromTurns: [22, 23],
    status: "accepted",
    createdAt: "2026-05-05T14:35:30Z",
    references: ["c-tdq4-5"]
  },
  {
    id: "c-tdq4-9",
    type: "signoff",
    summary: "Final agreement compiled, awaiting human sign-off.",
    derivedFromTurns: [24, 25],
    status: "pending",
    createdAt: "2026-05-05T14:38:30Z",
    references: ["c-tdq4-2", "c-tdq4-3", "c-tdq4-5", "c-tdq4-6", "c-tdq4-7", "c-tdq4-8"]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard table
// ─────────────────────────────────────────────────────────────────────────────

const deliberations: Deliberation[] = [
  {
    id: "training-data-q4",
    title: "training-data Q4 license",
    counterparty: "publisher-co",
    stage: "scope",
    flagged: false,
    waitingOn: { party: "counterparty" },
    commitmentCount: 9,
    lastActivity: ago(2),
    latestSummary: "Articles from 2018 onwards, English only, no opinion. 2-year non-exclusive license."
  },
  {
    id: "web-archive-opt-in",
    title: "web-archive opt-in",
    counterparty: "trinity-data",
    stage: "signoff",
    flagged: false,
    waitingOn: { party: "agent", agent: "legal-bot" },
    commitmentCount: 12,
    lastActivity: ago(11),
    latestSummary: "Crawl-delay 5s, robots.txt-respecting opt-in. 18-month renewable term."
  },
  {
    id: "archive-renewal-2026",
    title: "archive renewal 2026",
    counterparty: "publisher-co",
    stage: "signoff",
    flagged: false,
    waitingOn: { party: "you" },
    commitmentCount: 14,
    lastActivity: ago(28),
    latestSummary: "Renewal of 2024 archive license; CPI-indexed +6% with terms otherwise preserved."
  },
  {
    id: "clinical-imaging-pilot",
    title: "clinical imaging pilot",
    counterparty: "med-corpus",
    stage: "offer",
    flagged: false,
    waitingOn: { party: "counterparty" },
    commitmentCount: 2,
    lastActivity: ago(34),
    latestSummary: "12-month pilot, 50k de-identified DICOM studies, $0.12/study, HIPAA addendum referenced."
  },
  {
    id: "image-corpus-rev-share",
    title: "image corpus rev-share",
    counterparty: "zenith",
    stage: "scope",
    flagged: false,
    waitingOn: { party: "you" },
    commitmentCount: 5,
    lastActivity: ago(61),
    latestSummary: "12% gross revenue share on derivative model output, capped at $200k/yr."
  },
  {
    id: "pricing-renegotiation-zenith",
    title: "zenith pricing renegotiation",
    counterparty: "zenith",
    stage: "amendment",
    flagged: false,
    waitingOn: { party: "counterparty" },
    commitmentCount: 8,
    lastActivity: ago(60 * 3),
    latestSummary: "Tiered rev-share floor at $40k/yr; counterparty reviewing impact on existing imagery deals."
  },
  {
    id: "code-corpus-license",
    title: "code corpus license",
    counterparty: "octostack",
    stage: "offer",
    flagged: false,
    waitingOn: { party: "agent", agent: "policy-agent" },
    commitmentCount: 3,
    lastActivity: ago(181),
    latestSummary: "Public github repos only, MIT/Apache/BSD licensed code, 3-year term."
  },
  {
    id: "audio-podcasts-license",
    title: "audio podcasts license",
    counterparty: "trinity-data",
    stage: "scope",
    flagged: false,
    waitingOn: { party: "agent", agent: "legal-bot" },
    commitmentCount: 7,
    lastActivity: ago(60 * 5),
    latestSummary: "English-language interviews 2020+; speaker consent required for ad-supported tiers."
  },
  {
    id: "video-transcripts",
    title: "video transcripts",
    counterparty: "curio-press",
    stage: "scope",
    flagged: true,
    waitingOn: { party: "you" },
    commitmentCount: 4,
    lastActivity: ago(300),
    latestSummary: "Speaker-attribution dispute: counterparty claims rights extend to interviewees. Flagged for legal."
  },
  {
    id: "medical-journals-license",
    title: "medical journals license",
    counterparty: "med-corpus",
    stage: "amendment",
    flagged: false,
    waitingOn: { party: "counterparty" },
    commitmentCount: 9,
    lastActivity: ago(60 * 24 + 1),
    latestSummary: "Amendment §3: extend coverage to 2024 issues; counterparty reviewing pricing impact."
  },
  {
    id: "news-syndication-eu",
    title: "news syndication EU",
    counterparty: "curio-press",
    stage: "amendment",
    flagged: true,
    waitingOn: { party: "you" },
    commitmentCount: 5,
    lastActivity: ago(60 * 30),
    latestSummary: "DSM Article 15 carve-out: counterparty disputes scope of fair-use exemption. Legal escalation."
  }
];

const actions: Action[] = [
  {
    id: "a-1",
    kind: "human_signoff",
    commitment: {
      id: "c-pco-pending",
      type: "scope_clause",
      summary: "Scope clause awaiting your approval.",
      derivedFromTurns: [],
      status: "pending",
      createdAt: ago(2)
    },
    deliberationId: "training-data-q4",
    deliberationTitle: "training-data Q4 license",
    counterparty: "publisher-co"
  },
  {
    id: "a-2",
    kind: "human_signoff",
    commitment: {
      id: "c-zen-pending",
      type: "offer",
      summary: "Revenue-share offer awaiting your approval.",
      derivedFromTurns: [],
      status: "pending",
      createdAt: ago(14)
    },
    deliberationId: "image-corpus-rev-share",
    deliberationTitle: "image corpus rev-share",
    counterparty: "zenith"
  },
  {
    id: "a-3",
    kind: "agent_pending",
    agent: "policy-agent",
    commitment: {
      id: "c-med-pending",
      type: "amendment",
      summary: "Amendment §3 awaiting policy review.",
      derivedFromTurns: [],
      status: "pending",
      createdAt: ago(60)
    },
    deliberationId: "medical-journals-license",
    deliberationTitle: "medical journals license",
    counterparty: "med-corpus"
  },
  {
    id: "a-4",
    kind: "human_signoff",
    commitment: {
      id: "c-arr-pending",
      type: "signoff",
      summary: "2026 archive renewal — final agreement awaiting principal signature.",
      derivedFromTurns: [],
      status: "pending",
      createdAt: ago(28)
    },
    deliberationId: "archive-renewal-2026",
    deliberationTitle: "archive renewal 2026",
    counterparty: "publisher-co"
  },
  {
    id: "a-5",
    kind: "agent_pending",
    agent: "legal-bot",
    commitment: {
      id: "c-trin-audio-pending",
      type: "scope_clause",
      summary: "Speaker-consent clause awaiting legal review (interviewee opt-in vs. host opt-out).",
      derivedFromTurns: [],
      status: "pending",
      createdAt: ago(60 * 5)
    },
    deliberationId: "audio-podcasts-license",
    deliberationTitle: "audio podcasts license",
    counterparty: "trinity-data"
  }
];

const dashboardData: DashboardData = {
  counts: { active: 14, awaitingAction: 5, signed24h: 9, flagged: 2 },
  deliberations,
  actions
};

// ─────────────────────────────────────────────────────────────────────────────
// Stub details for the other deliberations — concise turns + commitments so
// the detail page renders something coherent when a user clicks through.
// ─────────────────────────────────────────────────────────────────────────────

function makeStubDetail(
  deliberation: Deliberation,
  baseIso: string,
  turns: Array<[speaker: string, content: string]>,
  commitments: Array<[type: CommitmentType, summary: string, status?: CommitmentStatus, derivedFromTurns?: number[]]>
): DeliberationDetail {
  const baseMs = new Date(baseIso).getTime();
  const idShort = deliberation.id
    .split("-")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 4);
  return {
    deliberation,
    turns: turns.map(([speaker, content], i) => ({
      id: i + 1,
      speaker,
      content,
      timestamp: new Date(baseMs + i * 90_000).toISOString()
    })),
    commitments: commitments.map(([type, summary, status = "accepted", derivedFromTurns = []], i) => ({
      id: `c-${idShort}-${i + 1}`,
      type,
      summary,
      derivedFromTurns,
      status,
      createdAt: new Date(baseMs + (i + 1) * 600_000).toISOString()
    }))
  };
}

const stubDetailConfigs: Array<{
  id: string;
  base: string;
  turns: Array<[string, string]>;
  commitments: Array<[CommitmentType, string, CommitmentStatus?, number[]?]>;
}> = [
  {
    id: "web-archive-opt-in",
    base: "2026-05-05T16:10:00Z",
    turns: [
      ["lab", "We'd like to opt in to your web archive crawl with reciprocal indexing rights."],
      ["trinity", "Open to it. We require crawl-delay >= 5s and full robots.txt compliance."],
      ["lab", "Confirmed. We'll honor crawl-delay and per-URL X-NoArchive at fetch time."],
      ["trinity", "Term — 18 months, renewable on 30-day notice. Acceptable?"],
      ["lab", "Acceptable. Renewable on either side, 30-day notice."],
      ["trinity", "Compiling final terms. Sending to legal-bot for sign-off."]
    ],
    commitments: [
      ["offer", "Lab proposes opt-in to trinity-data web archive with reciprocal indexing rights.", "accepted", [1, 2]],
      ["scope_clause", "Crawl-delay 5s minimum; robots.txt-respecting; URL-level X-NoArchive supported.", "accepted", [2, 3]],
      ["license_terms", "18-month renewable term with 30-day notice on either side.", "accepted", [4, 5]],
      ["signoff", "Final terms compiled, awaiting legal-bot review.", "pending", [6]]
    ]
  },
  {
    id: "archive-renewal-2026",
    base: "2026-05-05T16:00:00Z",
    turns: [
      ["lab", "Renewing the 2024 archive license. Same scope, term reset to 24 months."],
      ["publisher", "Acknowledged. We need CPI indexing applied to the per-article fee."],
      ["lab", "Acceptable. CPI-indexed annually, capped at +8% per year?"],
      ["publisher", "Cap at +6% to mirror our other renewals."],
      ["lab", "Agreed: +6% CPI cap, annual reset on contract anniversary."],
      ["publisher", "DPA carries over unchanged. Sending final to your principal for signature."],
      ["lab", "Final received. Routing to principal for sign-off."]
    ],
    commitments: [
      ["offer", "Renewal proposal: 2024 archive license, 24-month term reset, scope preserved.", "accepted", [1]],
      ["amendment", "CPI-indexed pricing with annual reset; +6% cap mirroring publisher-co's renewals.", "accepted", [2, 3, 4, 5]],
      ["dpa_reference", "Standard publisher-co DPA carries over unchanged.", "accepted", [6]],
      ["signoff", "Final renewal agreement awaiting principal signature.", "pending", [7]]
    ]
  },
  {
    id: "clinical-imaging-pilot",
    base: "2026-05-05T15:50:00Z",
    turns: [
      ["med-corpus", "Opening pilot — 50k de-identified DICOM studies over 12 months."],
      ["lab", "Pricing structure?"],
      ["med-corpus", "$0.12/study flat, billed monthly. Volume tiers at 75k and 100k available."],
      ["lab", "Tiered structure helps. Lock the $0.12 floor across the 12-month term?"],
      ["med-corpus", "Agreed. $0.12 floor preserved; tiered discounts above 75k."],
      ["lab", "HIPAA addendum needs to be referenced before any commitment is signed."],
      ["med-corpus", "Standard HIPAA-equivalent processing addendum attached. Awaiting your review."]
    ],
    commitments: [
      ["offer", "12-month pilot for 50k de-identified DICOM studies at $0.12/study.", "accepted", [1, 2, 3]],
      ["license_terms", "$0.12 per-study floor for term; tiered discounts at 75k and 100k volumes.", "accepted", [4, 5]],
      ["dpa_reference", "Med-corpus HIPAA-equivalent processing addendum attached.", "pending", [6, 7]]
    ]
  },
  {
    id: "image-corpus-rev-share",
    base: "2026-05-05T15:30:00Z",
    turns: [
      ["zenith", "Proposal: 12% gross revenue share on derivative model output, no upfront license fee."],
      ["lab", "Open to gross-rev-share but we need a cap — runaway tail-traffic could spike unexpectedly."],
      ["zenith", "Acceptable. Cap at $200k/yr; reset annually on contract anniversary."],
      ["lab", "Confirmed. 12% gross share, $200k/yr cap, annual reset."],
      ["zenith", "Reporting cadence — monthly or quarterly?"],
      ["lab", "Quarterly. Audit rights with 30-day notice."]
    ],
    commitments: [
      ["offer", "Zenith proposes 12% gross revenue share on derivative model output, no upfront fee.", "accepted", [1]],
      ["scope_clause", "Revenue share applies to derivative model commercial output only.", "accepted", [1]],
      ["license_terms", "12% gross share with $200k/yr cap; annual reset on anniversary.", "accepted", [2, 3, 4]],
      ["amendment", "Quarterly reporting cadence; 30-day notice audit rights.", "pending", [5, 6]]
    ]
  },
  {
    id: "pricing-renegotiation-zenith",
    base: "2026-05-05T13:30:00Z",
    turns: [
      ["lab", "Opening pricing renegotiation on existing zenith imagery deals — current floor is too thin for sustained model output."],
      ["zenith", "Concerned. Lifting the floor affects our other licensees who use the same rate card."],
      ["lab", "Proposed: tiered floor at $40k/yr for new commitments only; existing deals grandfathered."],
      ["zenith", "Reviewing impact across existing deals. Need 5 business days."],
      ["lab", "Acknowledged. Holding open until your review completes."]
    ],
    commitments: [
      ["amendment", "Open renegotiation: lift revenue-share floor for new commitments only.", "accepted", [1, 2]],
      ["counter", "Tiered floor at $40k/yr applied prospectively; grandfather existing deals.", "pending", [3]],
      ["scope_clause", "Amendment applies to new commitments only; existing deals preserve current floor.", "accepted", [3, 4, 5]]
    ]
  },
  {
    id: "code-corpus-license",
    base: "2026-05-05T13:29:00Z",
    turns: [
      ["lab", "Licensing public github repos for code-model training. Scope: MIT/Apache/BSD-licensed only."],
      ["octostack", "Acknowledged. Routing through compliance review."],
      ["octostack", "License-filter pre-applied: any repo with non-permissive license excluded automatically."],
      ["lab", "Confirmed. Pre-filter applied at ingest, no manual reconciliation needed."],
      ["octostack", "Term — 3 years, non-exclusive. Pricing structure?"],
      ["lab", "Per-repo flat fee, $0.50/repo/yr. Acceptable?"],
      ["octostack", "Counter: $0.65/repo/yr, scaled by repo size and stars."]
    ],
    commitments: [
      ["offer", "Lab proposes licensing octostack public repos for code-model training.", "accepted", [1, 2]],
      ["scope_clause", "MIT/Apache/BSD-licensed repos only; pre-filter applied at ingest.", "accepted", [3, 4]],
      ["license_terms", "3-year non-exclusive term.", "accepted", [5]],
      ["counter", "$0.65/repo/yr pricing scaled by size and stars (counter to lab's $0.50 flat).", "pending", [6, 7]]
    ]
  },
  {
    id: "audio-podcasts-license",
    base: "2026-05-05T11:30:00Z",
    turns: [
      ["lab", "Licensing English-language podcast interviews from 2020 onward."],
      ["trinity", "Speaker consent — opt-in by interviewee, opt-out by host. Acceptable framing?"],
      ["lab", "Workable. We need clarity on host vs. interviewee precedence."],
      ["trinity", "Host opt-out is dispositive for ad-supported tiers; interviewee opt-in is dispositive for premium training tiers."],
      ["lab", "Agreed. Two-tier consent model with explicit dispositive rules per tier."],
      ["trinity", "Routing to legal-bot for consent-clause review."]
    ],
    commitments: [
      ["offer", "Lab proposes licensing English-language podcast interviews 2020+.", "accepted", [1]],
      ["scope_clause", "Two-tier consent: host opt-out controls ad-supported; interviewee opt-in controls premium training.", "accepted", [2, 3, 4, 5]],
      ["participant_joined", "Speaker consent required per scope; both interviewee and host parties referenced.", "accepted", [5]],
      ["counter", "Speaker-consent clause awaiting legal-bot precedent review.", "pending", [6]]
    ]
  },
  {
    id: "video-transcripts",
    base: "2026-05-05T11:30:00Z",
    turns: [
      ["lab", "Licensing video transcripts from your editorial library."],
      ["curio-press", "Counter: rights extend to interviewees, not just curio-press as publisher. Speaker attribution required."],
      ["lab", "Disputed. Our reading: interviewees release rights via standard release on appearance."],
      ["curio-press", "Standard release covers broadcast, not derivative training. Different rights regime."],
      ["lab", "Escalating to legal. Holding all activity until counsel reviews."],
      ["curio-press", "Acknowledged. Legal-routing on our side as well."]
    ],
    commitments: [
      ["offer", "Lab proposes licensing curio-press video transcripts.", "accepted", [1]],
      ["counter", "Curio-press claims interviewee rights extend to derivative training; speaker attribution required.", "flagged", [2, 4]],
      ["scope_clause", "Speaker-attribution dispute escalated; both sides routing to legal counsel.", "flagged", [3, 5, 6]]
    ]
  },
  {
    id: "medical-journals-license",
    base: "2026-05-04T16:30:00Z",
    turns: [
      ["lab", "Amendment §3 — extend coverage to 2024 issues."],
      ["med-corpus", "Reviewing. 2024 issues represent ~18% volume increase, requires pricing adjustment."],
      ["lab", "Proposed: maintain $0.18/article rate, accept the volume bump."],
      ["med-corpus", "Counter: $0.21/article applied to 2024 issues only; legacy rate preserved for pre-2024."],
      ["lab", "Agreed in principle. Need formal sign-off from policy-agent before commitment."],
      ["med-corpus", "Standing by for policy-agent review."]
    ],
    commitments: [
      ["offer", "Amendment §3 to extend medical journals license to 2024 issues.", "accepted", [1]],
      ["amendment", "Coverage extended to 2024 issues; previously capped at 2023.", "accepted", [1, 2]],
      ["counter", "$0.21/article for 2024 issues; legacy $0.18 preserved for pre-2024 content.", "pending", [3, 4, 5]]
    ]
  },
  {
    id: "news-syndication-eu",
    base: "2026-05-03T10:30:00Z",
    turns: [
      ["lab", "Amendment proposal: DSM Article 15 carve-out for press publishers' rights."],
      ["curio-press", "Disputing the carve-out scope. Our reading: fair-use exemption does not apply to LLM training."],
      ["lab", "Counter: DSM §15 explicitly preserves fair-use carve-outs for research and computational analysis."],
      ["curio-press", "Different counsel reading. Routing to our legal team for formal response."],
      ["lab", "Pausing all syndication activity pending resolution. Estimated 5-7 business days."],
      ["curio-press", "Acknowledged. Legal review in progress."]
    ],
    commitments: [
      ["amendment", "DSM Article 15 carve-out proposal for press publishers' rights.", "accepted", [1]],
      ["counter", "Curio-press disputes scope of fair-use exemption applying to LLM training.", "flagged", [2]],
      ["scope_clause", "Both parties routing to legal counsel; activity paused 5-7 business days.", "flagged", [3, 4, 5, 6]]
    ]
  }
];

const stubDetails: Record<string, DeliberationDetail> = {};
for (const cfg of stubDetailConfigs) {
  const d = deliberations.find((x) => x.id === cfg.id);
  if (d) stubDetails[cfg.id] = makeStubDetail(d, cfg.base, cfg.turns, cfg.commitments);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public fixture accessors (consumed by lib/api.ts)
// ─────────────────────────────────────────────────────────────────────────────

export function fixtureDashboard(): DashboardData {
  return dashboardData;
}

export function fixtureDeliberation(id: string): DeliberationDetail | null {
  const deliberation = deliberations.find((d) => d.id === id);
  if (!deliberation) return null;
  if (id === "training-data-q4") {
    return {
      deliberation,
      turns: trainingDataQ4Turns,
      commitments: trainingDataQ4Commitments,
      hitlGate: trainingDataQ4HitlGate,
      postSignoffTasks: trainingDataQ4PostSignoff
    };
  }
  return stubDetails[id] ?? { deliberation, turns: [], commitments: [] };
}
