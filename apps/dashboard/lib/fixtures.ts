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
  { id: 1, speaker: "lab", content: "We're interested in licensing your news archive for training a foundation model.", timestamp: "2026-05-05T14:02:00Z" },
  { id: 2, speaker: "publisher", content: "Open to it. What scope and term are you thinking?", timestamp: "2026-05-05T14:03:00Z" },
  { id: 3, speaker: "lab", content: "Articles from 2018 onwards, English only, exclude opinion pieces.", timestamp: "2026-05-05T14:04:00Z" },
  { id: 4, speaker: "publisher", content: "Acceptable. Two-year non-exclusive.", timestamp: "2026-05-05T14:05:00Z" },
  { id: 5, speaker: "lab", content: "What about translated articles?", timestamp: "2026-05-05T14:07:00Z" },
  { id: 6, speaker: "publisher", content: "Original-language only. Translations are licensed separately by the rights-holders.", timestamp: "2026-05-05T14:08:00Z" },
  { id: 7, speaker: "lab", content: "Understood. Excluding translations from scope.", timestamp: "2026-05-05T14:09:00Z" },
  { id: 8, speaker: "publisher", content: "Confirmed.", timestamp: "2026-05-05T14:10:00Z" },
  { id: 9, speaker: "lab", content: "We'll send the agreement for sign-off shortly.", timestamp: "2026-05-05T14:12:00Z" },
  { id: 10, speaker: "publisher", content: "Standing by.", timestamp: "2026-05-05T14:13:00Z" }
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
    summary: "Articles from 2018 onwards, English only, no opinion. Two-year non-exclusive license.",
    derivedFromTurns: [3, 4],
    status: "accepted",
    createdAt: "2026-05-05T14:05:30Z"
  },
  {
    id: "c-tdq4-3",
    type: "amendment",
    summary: "Translated articles excluded from scope.",
    derivedFromTurns: [7, 8],
    status: "accepted",
    createdAt: "2026-05-05T14:10:30Z"
  },
  {
    id: "c-tdq4-4",
    type: "signoff",
    summary: "Final agreement, ready for human sign-off.",
    derivedFromTurns: [9, 10],
    status: "pending",
    createdAt: "2026-05-05T14:13:30Z"
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
    commitmentCount: 4,
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
