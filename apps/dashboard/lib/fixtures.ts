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
// Demo deliberation: archive-renewal-2026 (lab ↔ publisher-co)
// ─────────────────────────────────────────────────────────────────────────────

const archiveRenewal2026Turns: Turn[] = [
  { id: 1,  speaker: "lab",       content: "Renewing the 2024 archive license. Same scope, term reset to 24 months.", timestamp: "2026-05-05T15:30:00Z" },
  { id: 2,  speaker: "publisher", content: "Acknowledged. We need CPI indexing applied to the per-article fee.", timestamp: "2026-05-05T15:31:30Z" },
  { id: 3,  speaker: "lab",       content: "Acceptable in principle. What's the index source?", timestamp: "2026-05-05T15:33:00Z" },
  { id: 4,  speaker: "publisher", content: "BLS CPI-U, all-items, urban consumers. Annual reset on contract anniversary.", timestamp: "2026-05-05T15:34:30Z" },
  { id: 5,  speaker: "lab",       content: "Confirmed. CPI-indexed annually, capped at +8% per year?", timestamp: "2026-05-05T15:36:00Z" },
  { id: 6,  speaker: "publisher", content: "Cap at +6% to mirror our other renewals. Floor at 0% — no negative reset on deflation.", timestamp: "2026-05-05T15:37:30Z" },
  { id: 7,  speaker: "lab",       content: "Agreed: +6% cap, 0% floor, BLS CPI-U.", timestamp: "2026-05-05T15:39:00Z" },
  { id: 8,  speaker: "publisher", content: "Volume — last cycle averaged 1.4M articles/quarter with 4% growth. Projecting 1.55M next quarter. Pricing assumes that band.", timestamp: "2026-05-05T15:40:30Z" },
  { id: 9,  speaker: "lab",       content: "Accepted. Reconciliation to a fixed-fee renegotiation only if delta exceeds ±15%.", timestamp: "2026-05-05T15:42:00Z" },
  { id: 10, speaker: "publisher", content: "Workable. ±15% trigger, 30-day renegotiation window if breached.", timestamp: "2026-05-05T15:43:30Z" },
  { id: 11, speaker: "lab",       content: "24-hour audit notice carries over from the original. Confirmed?", timestamp: "2026-05-05T15:45:00Z" },
  { id: 12, speaker: "publisher", content: "Confirmed. Same scope (count reconciliation, no content access).", timestamp: "2026-05-05T15:46:30Z" },
  { id: 13, speaker: "lab",       content: "DPA — any updates to the GDPR-compliant template?", timestamp: "2026-05-05T15:48:00Z" },
  { id: 14, speaker: "publisher", content: "Standard DPA carries over unchanged. Article 28 sub-processor list updated, sent separately.", timestamp: "2026-05-05T15:49:30Z" },
  { id: 15, speaker: "lab",       content: "Reviewed. No deviations from approved sub-processors. Acknowledged.", timestamp: "2026-05-05T15:51:00Z" },
  { id: 16, speaker: "publisher", content: "Renewal opt-out — 90-day notice, either party, no penalty.", timestamp: "2026-05-05T15:52:30Z" },
  { id: 17, speaker: "lab",       content: "Agreed. 90-day notice, no penalty.", timestamp: "2026-05-05T15:54:00Z" },
  { id: 18, speaker: "publisher", content: "Compiling final renewal terms. Sending to your principal for signature.", timestamp: "2026-05-05T15:55:30Z" },
  { id: 19, speaker: "lab",       content: "Final received. Routing to principal. Auto-approve renewals policy fired (within $50k threshold). Awaiting human ack.", timestamp: "2026-05-05T16:02:00Z" }
];

const archiveRenewal2026Commitments: Commitment[] = [
  { id: "c-arr-1", type: "offer",
    summary: "Renewal proposal: 2024 archive license, 24-month term reset, scope preserved.",
    derivedFromTurns: [1], status: "accepted", createdAt: "2026-05-05T15:31:00Z" },
  { id: "c-arr-2", type: "amendment",
    summary: "BLS CPI-U indexed pricing with annual reset; +6% cap, 0% floor (no deflation reset).",
    derivedFromTurns: [2, 3, 4, 5, 6, 7], status: "accepted", createdAt: "2026-05-05T15:39:30Z",
    references: ["c-arr-1"] },
  { id: "c-arr-3", type: "license_terms",
    summary: "Volume band 1.4–1.55M/quarter; ±15% delta triggers a 30-day fixed-fee renegotiation window.",
    derivedFromTurns: [8, 9, 10], status: "accepted", createdAt: "2026-05-05T15:44:00Z",
    references: ["c-arr-1", "c-arr-2"] },
  { id: "c-arr-4", type: "amendment",
    summary: "Audit rights carry over: 24-hour notice, count reconciliation only (no content access).",
    derivedFromTurns: [11, 12], status: "accepted", createdAt: "2026-05-05T15:47:00Z",
    references: ["c-arr-1"] },
  { id: "c-arr-5", type: "dpa_reference",
    summary: "Publisher-co GDPR-compliant DPA carries over unchanged; sub-processor list refreshed (no deviations).",
    derivedFromTurns: [13, 14, 15], status: "accepted", createdAt: "2026-05-05T15:51:30Z" },
  { id: "c-arr-6", type: "amendment",
    summary: "Renewal opt-out: 90-day notice either party, no penalty.",
    derivedFromTurns: [16, 17], status: "accepted", createdAt: "2026-05-05T15:54:30Z",
    references: ["c-arr-1"] },
  { id: "c-arr-7", type: "signoff",
    summary: "Final renewal compiled; auto-approve renewals policy fired; awaiting principal signature.",
    derivedFromTurns: [18, 19], status: "pending", createdAt: "2026-05-05T16:02:30Z",
    references: ["c-arr-1", "c-arr-2", "c-arr-3", "c-arr-4", "c-arr-5", "c-arr-6"] }
];

const archiveRenewal2026PostSignoff = [
  {
    id: "ps-arr-1",
    kind: "agent2agent" as const,
    agent: "billing-agent",
    deliverable: "update ACH for CPI-indexed pricing; configure quarterly volume reconciliation with ±15% trigger",
    derivedFromCommitment: "c-arr-2"
  },
  {
    id: "ps-arr-2",
    kind: "agent2agent" as const,
    agent: "compliance-agent",
    deliverable: "register refreshed Article 28 sub-processor list; update DPA reference URL",
    derivedFromCommitment: "c-arr-5"
  },
  {
    id: "ps-arr-3",
    kind: "human_signoff" as const,
    deliverable: "principal sign-off on the renewal binds the lab to all carried-over and amended terms",
    derivedFromCommitment: "c-arr-7"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Demo deliberation: clinical-imaging-pilot (lab ↔ med-corpus)
// ─────────────────────────────────────────────────────────────────────────────

const clinicalImagingPilotTurns: Turn[] = [
  { id: 1,  speaker: "med-corpus", content: "Opening clinical imaging pilot — 50k de-identified DICOM studies over 12 months.", timestamp: "2026-05-05T15:25:00Z" },
  { id: 2,  speaker: "lab",        content: "Confirmed receipt. De-identification standard?", timestamp: "2026-05-05T15:26:30Z" },
  { id: 3,  speaker: "med-corpus", content: "HIPAA Safe Harbor (45 CFR 164.514(b)(2)) applied across all 18 identifiers; pixel-data scrubbed of burned-in PHI via OCR pass.", timestamp: "2026-05-05T15:28:00Z" },
  { id: 4,  speaker: "lab",        content: "Safe Harbor preferred. Audit trail on the de-id process — can you provide certification per study or batch?", timestamp: "2026-05-05T15:29:30Z" },
  { id: 5,  speaker: "med-corpus", content: "Batch-level certification, 1k-study batches. Per-study attestation available on request for $0.40/cert.", timestamp: "2026-05-05T15:31:00Z" },
  { id: 6,  speaker: "lab",        content: "Batch-level is sufficient. Skip per-study certs.", timestamp: "2026-05-05T15:32:30Z" },
  { id: 7,  speaker: "med-corpus", content: "Pricing — $0.12/study flat, billed monthly. Volume tiers: $0.10 above 75k, $0.08 above 100k.", timestamp: "2026-05-05T15:34:00Z" },
  { id: 8,  speaker: "lab",        content: "Term-lock the $0.12 floor across the 12-month pilot? Tier discounts apply to incremental volume only?", timestamp: "2026-05-05T15:35:30Z" },
  { id: 9,  speaker: "med-corpus", content: "Confirmed. $0.12 floor preserved for pilot term; tier discounts on incremental studies only.", timestamp: "2026-05-05T15:37:00Z" },
  { id: 10, speaker: "lab",        content: "HIPAA addendum — we need a BAA referenced before any commitment is signed. Compliance policy gate (pol-8).", timestamp: "2026-05-05T15:38:30Z" },
  { id: 11, speaker: "med-corpus", content: "Standard BAA template attached. HIPAA-equivalent processing addendum cross-referenced. Ready for review.", timestamp: "2026-05-05T15:40:00Z" },
  { id: 12, speaker: "lab",        content: "BAA reviewed. One redline: incident notification window — 24 hours, not 72.", timestamp: "2026-05-05T15:41:30Z" },
  { id: 13, speaker: "med-corpus", content: "24-hour breach notification accepted. Updating BAA §6.2.", timestamp: "2026-05-05T15:43:00Z" },
  { id: 14, speaker: "lab",        content: "Audit rights — quarterly de-id sampling, 30-day notice?", timestamp: "2026-05-05T15:44:30Z" },
  { id: 15, speaker: "med-corpus", content: "Quarterly sampling acceptable, 30-day notice. Sample size — capped at 1% of cumulative studies per quarter?", timestamp: "2026-05-05T15:46:00Z" },
  { id: 16, speaker: "lab",        content: "1% cap accepted.", timestamp: "2026-05-05T15:47:30Z" },
  { id: 17, speaker: "med-corpus", content: "Renewal — open to converting pilot to multi-year if usage exceeds 80k studies in 9 months.", timestamp: "2026-05-05T15:49:00Z" },
  { id: 18, speaker: "lab",        content: "Renewal trigger noted. Not committing now, but acknowledged for terms framework.", timestamp: "2026-05-05T15:50:30Z" },
  { id: 19, speaker: "med-corpus", content: "Compiling final pilot terms. Routing to your compliance review.", timestamp: "2026-05-05T15:52:00Z" },
  { id: 20, speaker: "lab",        content: "HIPAA addendum policy fired on c-cip-3. Holding for principal acknowledgment per pol-8.", timestamp: "2026-05-05T15:56:00Z" }
];

const clinicalImagingPilotCommitments: Commitment[] = [
  { id: "c-cip-1", type: "offer",
    summary: "12-month pilot for 50k de-identified DICOM studies.",
    derivedFromTurns: [1, 2], status: "accepted", createdAt: "2026-05-05T15:26:45Z" },
  { id: "c-cip-2", type: "scope_clause",
    summary: "De-id via HIPAA Safe Harbor (45 CFR 164.514) with OCR pixel-scrubbing; batch-level certification (1k-study batches).",
    derivedFromTurns: [3, 4, 5, 6], status: "accepted", createdAt: "2026-05-05T15:33:00Z",
    references: ["c-cip-1"] },
  { id: "c-cip-3", type: "dpa_reference",
    summary: "HIPAA BAA referenced; incident notification redlined to 24 hours (BAA §6.2).",
    derivedFromTurns: [10, 11, 12, 13], status: "pending", createdAt: "2026-05-05T15:43:30Z",
    references: ["c-cip-2"] },
  { id: "c-cip-4", type: "license_terms",
    summary: "$0.12/study floor for pilot term; tier discounts ($0.10 above 75k, $0.08 above 100k) on incremental volume only.",
    derivedFromTurns: [7, 8, 9], status: "accepted", createdAt: "2026-05-05T15:37:30Z",
    references: ["c-cip-1"] },
  { id: "c-cip-5", type: "amendment",
    summary: "Audit rights: quarterly de-id sampling capped at 1% of cumulative studies, 30-day notice.",
    derivedFromTurns: [14, 15, 16], status: "accepted", createdAt: "2026-05-05T15:48:00Z",
    references: ["c-cip-1"] },
  { id: "c-cip-6", type: "scope_clause",
    summary: "Renewal trigger framework: 80k studies in 9 months opens multi-year conversion (no commitment).",
    derivedFromTurns: [17, 18], status: "accepted", createdAt: "2026-05-05T15:51:00Z",
    references: ["c-cip-1"] },
  { id: "c-cip-7", type: "signoff",
    summary: "Final pilot terms compiled; HIPAA-addendum gate (pol-8) holding for principal acknowledgment.",
    derivedFromTurns: [19, 20], status: "pending", createdAt: "2026-05-05T15:56:30Z",
    references: ["c-cip-1", "c-cip-2", "c-cip-3", "c-cip-4", "c-cip-5", "c-cip-6"] }
];

const clinicalImagingPilotHitlGate = {
  afterTurn: 10,
  policyBound: "HIPAA addendum required (pol-8)",
  prompt: "Med-corpus engagements require an explicit HIPAA addendum reference before commitment signing. Counterparty has attached a BAA template. Authorize the agent to redline and sign in scope, or hold for principal review.",
  commitmentRef: "c-cip-3"
};

const clinicalImagingPilotPostSignoff = [
  {
    id: "ps-cip-1",
    kind: "agent2agent" as const,
    agent: "compliance-agent",
    deliverable: "register BAA template with 24h breach notification; configure quarterly audit-sampling timer",
    derivedFromCommitment: "c-cip-3"
  },
  {
    id: "ps-cip-2",
    kind: "agent2agent" as const,
    agent: "billing-agent",
    deliverable: "schedule monthly $0.12/study; tier breakpoints at 75k and 100k cumulative",
    derivedFromCommitment: "c-cip-4"
  },
  {
    id: "ps-cip-3",
    kind: "human_signoff" as const,
    deliverable: "principal acknowledgment on HIPAA addendum (pol-8 compliance gate)",
    derivedFromCommitment: "c-cip-7"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Demo deliberation: video-transcripts (lab ↔ curio-press, FLAGGED)
// ─────────────────────────────────────────────────────────────────────────────

const videoTranscriptsTurns: Turn[] = [
  { id: 1,  speaker: "lab",         content: "Licensing video transcripts from your editorial library — 2020+, English, derivative-training scope.", timestamp: "2026-05-05T11:00:00Z" },
  { id: 2,  speaker: "curio-press", content: "Scope question: rights extend to interviewees, not just curio-press as publisher. Speaker attribution required across all derivative output.", timestamp: "2026-05-05T11:01:30Z" },
  { id: 3,  speaker: "lab",         content: "Disputed. Standard appearance release covers broadcast and derivative use. Speaker rights exhausted at signing.", timestamp: "2026-05-05T11:03:00Z" },
  { id: 4,  speaker: "curio-press", content: "Standard release covers broadcast distribution only — derivative training is a separate rights regime under 17 U.S.C. §107 and our standard contracts.", timestamp: "2026-05-05T11:04:30Z" },
  { id: 5,  speaker: "lab",         content: "§107 fair-use carve-outs exempt non-commercial research and computational analysis. Our use case qualifies.", timestamp: "2026-05-05T11:06:00Z" },
  { id: 6,  speaker: "curio-press", content: "Position: training of commercial models is not non-commercial research. Outputs are revenue-generating derivative works.", timestamp: "2026-05-05T11:07:30Z" },
  { id: 7,  speaker: "lab",         content: "We can adopt aggregate-only attribution language on model cards (no per-source naming) — same approach as the publisher-co deal.", timestamp: "2026-05-05T11:09:00Z" },
  { id: 8,  speaker: "curio-press", content: "Aggregate-only attribution does not address per-interviewee rights. Each interviewee retained derivative rights via §3.2 of standard release.", timestamp: "2026-05-05T11:10:30Z" },
  { id: 9,  speaker: "lab",         content: "Routing to internal counsel for §3.2 review. Holding deliberation open.", timestamp: "2026-05-05T11:12:00Z" },
  { id: 10, speaker: "curio-press", content: "Acknowledged. We're routing to counsel as well.", timestamp: "2026-05-05T11:13:30Z" },
  { id: 11, speaker: "lab",         content: "Counsel review complete. §3.2 reservation interpreted as broadcast-medium specific; derivative use is silent. Lab reading: rights pass on derivative.", timestamp: "2026-05-05T11:15:00Z" },
  { id: 12, speaker: "curio-press", content: "Counter-reading: silent contract terms construed against drafter (curio-press); ambiguity resolved by intent — derivative rights NOT transferred.", timestamp: "2026-05-05T11:16:30Z" },
  { id: 13, speaker: "lab",         content: "Stalemate on §3.2. Compromise: per-interviewee opt-out registry, lab honors registry entries with 14-day purge SLA on flagged content.", timestamp: "2026-05-05T11:18:00Z" },
  { id: 14, speaker: "curio-press", content: "Opt-out registry workable but insufficient. Required: opt-IN per interviewee for derivative use, no implicit consent.", timestamp: "2026-05-05T11:19:30Z" },
  { id: 15, speaker: "lab",         content: "Opt-in is non-starter — destroys the corpus utility. Registry-based opt-out is our ceiling.", timestamp: "2026-05-05T11:21:00Z" },
  { id: 16, speaker: "curio-press", content: "Holding. Counsel preparing formal response.", timestamp: "2026-05-05T11:22:30Z" },
  { id: 17, speaker: "lab",         content: "Pausing all activity on this deliberation. Flagged for legal review per pol-3 (curio-press watchlist).", timestamp: "2026-05-05T11:30:00Z" }
];

const videoTranscriptsCommitments: Commitment[] = [
  { id: "c-vid-1", type: "offer",
    summary: "Licensing curio-press video transcripts (2020+, English) for derivative model training.",
    derivedFromTurns: [1], status: "accepted", createdAt: "2026-05-05T11:01:00Z" },
  { id: "c-vid-2", type: "counter",
    summary: "Curio-press counter: interviewee rights extend to derivative training; speaker attribution required.",
    derivedFromTurns: [2, 3, 4], status: "flagged", createdAt: "2026-05-05T11:05:00Z",
    references: ["c-vid-1"] },
  { id: "c-vid-3", type: "scope_clause",
    summary: "§107 fair-use carve-out invoked by lab; curio-press disputes commercial-use applicability.",
    derivedFromTurns: [5, 6], status: "flagged", createdAt: "2026-05-05T11:08:00Z",
    references: ["c-vid-2"] },
  { id: "c-vid-4", type: "amendment",
    summary: "Aggregate-only attribution language proposed (no per-source naming) — rejected as insufficient for per-interviewee rights.",
    derivedFromTurns: [7, 8], status: "flagged", createdAt: "2026-05-05T11:11:00Z",
    references: ["c-vid-2"] },
  { id: "c-vid-5", type: "counter",
    summary: "§3.2 of standard release: lab reads as broadcast-only carve-out; curio-press reads as preserving derivative rights. Stalemate.",
    derivedFromTurns: [11, 12], status: "flagged", createdAt: "2026-05-05T11:17:00Z",
    references: ["c-vid-2", "c-vid-3"] },
  { id: "c-vid-6", type: "scope_clause",
    summary: "Per-interviewee opt-out registry with 14-day purge SLA (lab) vs. per-interviewee opt-IN (curio-press). Stalemate.",
    derivedFromTurns: [13, 14, 15], status: "flagged", createdAt: "2026-05-05T11:21:30Z",
    references: ["c-vid-5"] },
  { id: "c-vid-7", type: "counter",
    summary: "Activity paused per pol-3 watchlist; both sides routing to counsel.",
    derivedFromTurns: [16, 17], status: "flagged", createdAt: "2026-05-05T11:30:30Z",
    references: ["c-vid-2", "c-vid-5", "c-vid-6"] }
];

const videoTranscriptsHitlGate = {
  afterTurn: 8,
  policyBound: "Watchlist counterparty (pol-3): curio-press",
  prompt: "Curio-press is on watchlist. Counsel-level scope dispute on interviewee rights (§3.2 reading) emerged. Authorize the agent to compromise on registry-based opt-out, or hold for legal review.",
  commitmentRef: "c-vid-5"
};

// ─────────────────────────────────────────────────────────────────────────────
// Demo deliberation: news-syndication-eu (lab ↔ curio-press, FLAGGED)
// ─────────────────────────────────────────────────────────────────────────────

const newsSyndicationEuTurns: Turn[] = [
  { id: 1,  speaker: "lab",         content: "Amendment proposal: DSM Article 15 carve-out for press publishers' rights — required for our EU model deployment.", timestamp: "2026-05-04T10:00:00Z" },
  { id: 2,  speaker: "curio-press", content: "Disputing the carve-out scope. Our reading: §15 grants publishers a 2-year ancillary right; fair-use exemption does not apply to LLM training.", timestamp: "2026-05-04T10:01:30Z" },
  { id: 3,  speaker: "lab",         content: "Counter: §15(1) explicitly lists exceptions for \"individual words or very short extracts\" and computational use under §3 of the same directive (TDM exception, Article 3).", timestamp: "2026-05-04T10:03:00Z" },
  { id: 4,  speaker: "curio-press", content: "TDM Article 3 applies to non-commercial scientific research. LLM training is commercial. Article 4 (general TDM) requires opt-in by rightsholder.", timestamp: "2026-05-04T10:04:30Z" },
  { id: 5,  speaker: "lab",         content: "Article 4 has rightsholder reservation mechanism — opt-out via machine-readable signal (robots.txt, ai.txt). We respect those signals at fetch.", timestamp: "2026-05-04T10:06:00Z" },
  { id: 6,  speaker: "curio-press", content: "Reservation respected, but our position: Article 4 is moot here because Article 15 is the controlling regime for press publishers' content. §15 is lex specialis.", timestamp: "2026-05-04T10:07:30Z" },
  { id: 7,  speaker: "lab",         content: "Lex specialis argument is debated. Member-state implementations vary — Germany (UrhDG §87f) preserves §3 TDM independent of §15; France (CPI L218-1) reads §15 broadly.", timestamp: "2026-05-04T10:09:00Z" },
  { id: 8,  speaker: "curio-press", content: "Our publishing footprint is primarily German + Italian. Italian implementation (DLgs 177/2021) follows French-broad reading.", timestamp: "2026-05-04T10:10:30Z" },
  { id: 9,  speaker: "lab",         content: "Acknowledge member-state divergence. Proposed: scope amendment limits derivative use to UrhDG-compliant member states (Germany, Netherlands, Austria) for the next 12 months.", timestamp: "2026-05-04T10:12:00Z" },
  { id: 10, speaker: "curio-press", content: "Geographic scope narrowing acceptable in principle. Pricing impact: ~70% volume reduction. Per-article fee must adjust to reflect reduced corpus.", timestamp: "2026-05-04T10:13:30Z" },
  { id: 11, speaker: "lab",         content: "Counter: $0.0006/article (down from $0.0011) for narrowed scope; quarterly true-up if volume rises.", timestamp: "2026-05-04T10:15:00Z" },
  { id: 12, speaker: "curio-press", content: "Pricing acceptable. But we need formal opinion from your EU counsel before signing — this affects our standard form going forward.", timestamp: "2026-05-04T10:16:30Z" },
  { id: 13, speaker: "lab",         content: "Routing to EU counsel for formal opinion. Estimated 5-7 business days.", timestamp: "2026-05-04T10:18:00Z" },
  { id: 14, speaker: "curio-press", content: "Acknowledged. Activity pause.", timestamp: "2026-05-04T10:19:30Z" },
  { id: 15, speaker: "lab",         content: "Counsel preliminary read: §3 TDM exception preserved across all member states regardless of §15. Their formal memo arrives Friday.", timestamp: "2026-05-04T10:21:00Z" },
  { id: 16, speaker: "curio-press", content: "Our counsel disagrees on §3 applicability post-§15 implementation. We'll exchange formal memos through legal-bot.", timestamp: "2026-05-04T10:22:30Z" },
  { id: 17, speaker: "lab",         content: "Spend cap policy fired (€220k threshold) on the corpus delivery quote. Holding for principal review per pol-2.", timestamp: "2026-05-04T10:24:00Z" },
  { id: 18, speaker: "curio-press", content: "Standing by. No further action until your principal acknowledges.", timestamp: "2026-05-04T10:30:00Z" }
];

const newsSyndicationEuCommitments: Commitment[] = [
  { id: "c-nse-1", type: "amendment",
    summary: "DSM Article 15 carve-out proposal for press publishers' rights (EU scope).",
    derivedFromTurns: [1], status: "accepted", createdAt: "2026-05-04T10:01:00Z" },
  { id: "c-nse-2", type: "counter",
    summary: "Curio-press disputes scope of TDM/fair-use exemption applying to LLM training.",
    derivedFromTurns: [2, 3, 4, 5, 6], status: "flagged", createdAt: "2026-05-04T10:08:00Z",
    references: ["c-nse-1"] },
  { id: "c-nse-3", type: "scope_clause",
    summary: "Member-state divergence acknowledged; scope narrowed to UrhDG-compliant jurisdictions (Germany, Netherlands, Austria) for 12 months.",
    derivedFromTurns: [7, 8, 9], status: "accepted", createdAt: "2026-05-04T10:12:30Z",
    references: ["c-nse-2"] },
  { id: "c-nse-4", type: "license_terms",
    summary: "Per-article fee adjusted to $0.0006 (from $0.0011) for narrowed scope; quarterly true-up if volume rises.",
    derivedFromTurns: [10, 11], status: "accepted", createdAt: "2026-05-04T10:15:30Z",
    references: ["c-nse-3"] },
  { id: "c-nse-5", type: "counter",
    summary: "Both sides routing to EU counsel for formal opinion on §3 TDM vs. §15 lex specialis.",
    derivedFromTurns: [12, 13, 14, 15, 16], status: "flagged", createdAt: "2026-05-04T10:23:00Z",
    references: ["c-nse-2"] },
  { id: "c-nse-6", type: "scope_clause",
    summary: "Counsel exchange via legal-bot; activity paused 5–7 business days pending memo exchange.",
    derivedFromTurns: [13, 14, 15, 16], status: "flagged", createdAt: "2026-05-04T10:23:30Z",
    references: ["c-nse-5"] },
  { id: "c-nse-7", type: "signoff",
    summary: "Spend cap fired (€220k) on corpus delivery quote; awaiting principal acknowledgment per pol-2.",
    derivedFromTurns: [17, 18], status: "pending", createdAt: "2026-05-04T10:30:30Z",
    references: ["c-nse-3", "c-nse-4", "c-nse-5"] }
];

const newsSyndicationEuHitlGate = {
  afterTurn: 17,
  policyBound: "Spend cap policy: €250k per deliberation (pol-2)",
  prompt: "Corpus delivery quote (€220k) approaches the €250k spend cap. Counter-reading on TDM Article 3 vs. §15 still pending counsel. Authorize the agent to proceed with narrowed-scope amendment, or hold for principal sign-off and legal memo exchange.",
  commitmentRef: "c-nse-7"
};

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
  switch (id) {
    case "training-data-q4":
      return {
        deliberation,
        turns: trainingDataQ4Turns,
        commitments: trainingDataQ4Commitments,
        hitlGate: trainingDataQ4HitlGate,
        postSignoffTasks: trainingDataQ4PostSignoff
      };
    case "archive-renewal-2026":
      return {
        deliberation,
        turns: archiveRenewal2026Turns,
        commitments: archiveRenewal2026Commitments,
        postSignoffTasks: archiveRenewal2026PostSignoff
      };
    case "clinical-imaging-pilot":
      return {
        deliberation,
        turns: clinicalImagingPilotTurns,
        commitments: clinicalImagingPilotCommitments,
        hitlGate: clinicalImagingPilotHitlGate,
        postSignoffTasks: clinicalImagingPilotPostSignoff
      };
    case "video-transcripts":
      return {
        deliberation,
        turns: videoTranscriptsTurns,
        commitments: videoTranscriptsCommitments,
        hitlGate: videoTranscriptsHitlGate
      };
    case "news-syndication-eu":
      return {
        deliberation,
        turns: newsSyndicationEuTurns,
        commitments: newsSyndicationEuCommitments,
        hitlGate: newsSyndicationEuHitlGate
      };
  }
  return stubDetails[id] ?? { deliberation, turns: [], commitments: [] };
}
