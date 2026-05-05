import { DEMO_NOW_ISO } from "./format";
import type {
  Action,
  Commitment,
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
  { id: 14, speaker: "lab",       content: "Opt-out — we'll honor robots.txt and per-URL X-NoArchive headers at the time of fetch.", timestamp: "2026-05-05T14:21:00Z" },
  { id: 15, speaker: "publisher", content: "Add a kill-switch: if we issue a retraction or legal removal request, you must purge from training data within 7 days.", timestamp: "2026-05-05T14:22:00Z" },
  { id: 16, speaker: "lab",       content: "Confirmed. 7-day retraction SLA, audit-logged.", timestamp: "2026-05-05T14:23:00Z" },
  { id: 17, speaker: "publisher", content: "Usage restrictions — no resale of derivative model weights, no public attribution claims naming us as a training source.", timestamp: "2026-05-05T14:25:00Z" },
  { id: 18, speaker: "lab",       content: "Agreed: no resale of weights, no model-card naming of publisher-co as a source.", timestamp: "2026-05-05T14:26:00Z" },
  { id: 19, speaker: "publisher", content: "Data processing — we'll reference our standard DPA, GDPR-compliant. Linking the latest version.", timestamp: "2026-05-05T14:28:00Z" },
  { id: 20, speaker: "lab",       content: "DPA reviewed and attached. No deviations from standard.", timestamp: "2026-05-05T14:30:00Z" },
  { id: 21, speaker: "lab",       content: "Compiling all terms. Sending for sign-off.", timestamp: "2026-05-05T14:32:00Z" },
  { id: 22, speaker: "publisher", content: "Standing by.", timestamp: "2026-05-05T14:33:00Z" }
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
    summary: "Honors robots.txt and X-NoArchive at fetch; 7-day purge SLA on retraction request.",
    derivedFromTurns: [14, 15, 16],
    status: "accepted",
    createdAt: "2026-05-05T14:23:30Z",
    references: ["c-tdq4-2"]
  },
  {
    id: "c-tdq4-7",
    type: "usage_restriction",
    summary: "No resale of derivative model weights; no model-card attribution naming publisher-co.",
    derivedFromTurns: [17, 18],
    status: "accepted",
    createdAt: "2026-05-05T14:26:30Z",
    references: ["c-tdq4-2", "c-tdq4-5"]
  },
  {
    id: "c-tdq4-8",
    type: "dpa_reference",
    summary: "Standard publisher-co GDPR-compliant DPA attached without modification.",
    derivedFromTurns: [19, 20],
    status: "accepted",
    createdAt: "2026-05-05T14:30:30Z",
    references: ["c-tdq4-5"]
  },
  {
    id: "c-tdq4-9",
    type: "signoff",
    summary: "Final agreement compiled, awaiting human sign-off.",
    derivedFromTurns: [21, 22],
    status: "pending",
    createdAt: "2026-05-05T14:33:30Z",
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
  }
];

const dashboardData: DashboardData = {
  counts: { active: 12, awaitingAction: 3, signed24h: 7, flagged: 1 },
  deliberations,
  actions
};

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
    return { deliberation, turns: trainingDataQ4Turns, commitments: trainingDataQ4Commitments };
  }
  // Other deliberations have stub turns/commitments — not navigated to in the demo,
  // but the page still needs to render without crashing.
  return { deliberation, turns: [], commitments: [] };
}
