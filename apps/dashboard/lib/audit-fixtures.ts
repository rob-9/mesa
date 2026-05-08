import type { AuditEvent } from "./types";

// Deterministic short hash-like strings for the demo.
function h(seed: number): string {
  let x = seed * 2654435761;
  let out = "";
  for (let i = 0; i < 12; i++) {
    x = (x ^ (x << 7)) >>> 0;
    x = (x ^ (x >>> 11)) >>> 0;
    out += ((x >>> (i * 2)) & 0xf).toString(16);
  }
  return out;
}

interface Seed {
  ts: string;
  kind: AuditEvent["kind"];
  actor: string;
  target: string;
  summary: string;
  payload?: Record<string, unknown>;
}

const seeds: Seed[] = [
  { ts: "2026-05-05T16:28:00Z", kind: "transcript_turn", actor: "publisher-co/agent-001", target: "training-data-q4#turn-22",
    summary: "publisher: Standing by.",
    payload: { length: 14, locale: "en", language_detect: "en", sender_key: "ed25519:91a3…0f2b" } },
  { ts: "2026-05-05T16:25:30Z", kind: "transcript_turn", actor: "lab-buyer-agent", target: "training-data-q4#turn-21",
    summary: "lab: Compiling all terms. Sending for sign-off.",
    payload: { length: 49, sender_key: "ed25519:lab1…aa00" } },
  { ts: "2026-05-05T16:19:00Z", kind: "policy_fired", actor: "policy-agent", target: "pol-4",
    summary: "Auto-approve renewals (publisher-co) flagged commitment c-tdq4-9.",
    payload: { policy_id: "pol-4", commitment_id: "c-tdq4-9", action: "flag" } },
  { ts: "2026-05-05T16:15:00Z", kind: "policy_fired", actor: "policy-agent", target: "pol-2",
    summary: "Spend cap policy flagged news-syndication-eu (€220k — escalation trigger).",
    payload: { policy_id: "pol-2", action: "block", commitment_id: "c-nse-3" } },
  { ts: "2026-05-05T16:00:00Z", kind: "commitment_signed", actor: "publisher-co/agent-001", target: "c-tdq4-8",
    summary: "DPA reference (publisher-co standard, GDPR-compliant) signed.",
    payload: { commitment_type: "dpa_reference", deliberation: "training-data-q4" } },
  { ts: "2026-05-05T15:55:00Z", kind: "commitment_signed", actor: "lab-buyer-agent", target: "c-tdq4-7",
    summary: "Usage restriction signed: no resale of derivative weights.",
    payload: { commitment_type: "usage_restriction" } },
  { ts: "2026-05-05T15:42:00Z", kind: "policy_fired", actor: "policy-agent", target: "pol-1",
    summary: "Term cap policy flagged term_months=24 (within tolerance, info-only).",
    payload: { policy_id: "pol-1", action: "flag", commitment_id: "c-tdq4-2" } },
  { ts: "2026-05-05T15:30:00Z", kind: "commitment_signed", actor: "lab-buyer-agent", target: "c-arr-3",
    summary: "Archive renewal 2026: pricing index clause signed (CPI +6%, annual reset).",
    payload: { commitment_type: "license_terms", deliberation: "archive-renewal-2026" } },
  { ts: "2026-05-05T14:10:00Z", kind: "commitment_signed", actor: "lab-buyer-agent", target: "c-tdq4-3",
    summary: "Scope amendment: translated articles excluded.",
    payload: { commitment_type: "amendment" } },
  { ts: "2026-05-05T13:00:00Z", kind: "agent_deployed", actor: "rj@mesa.dev", target: "policy-agent",
    summary: "Agent policy-agent deployed (v0.4.2).",
    payload: { model: "claude-opus-4-7", version: "0.4.2" } },
  { ts: "2026-05-05T12:45:00Z", kind: "transcript_turn", actor: "trinity-data/orion", target: "audio-podcasts-license#turn-12",
    summary: "trinity: Speaker consent — opt-in by interviewee, opt-out by host. Acceptable framing?",
    payload: { length: 56, sender_key: "ed25519:34bd…77c9" } },
  { ts: "2026-05-04T11:45:00Z", kind: "principal_added", actor: "rj@mesa.dev", target: "principal-mz",
    summary: "Principal M. Zhao (legal) added with key ed25519:7fa1…b3c4.",
    payload: { fingerprint: "ed25519:7fa1…b3c4" } },
  { ts: "2026-05-04T10:02:00Z", kind: "policy_fired", actor: "policy-agent", target: "pol-3",
    summary: "Watchlist policy routed curio-press signoff to legal-bot.",
    payload: { policy_id: "pol-3", action: "route", route_to: "legal-bot" } },
  { ts: "2026-05-04T08:30:00Z", kind: "transcript_turn", actor: "med-corpus/apex", target: "clinical-imaging-pilot#turn-1",
    summary: "med-corpus: Pilot kickoff — 50k de-identified DICOM studies, 12-month, open to volume tiers.",
    payload: { length: 81, sender_key: "ed25519:2298…44a0" } },
  { ts: "2026-05-04T07:14:00Z", kind: "commitment_signed", actor: "med-corpus/apex", target: "c-cip-1",
    summary: "Clinical imaging pilot: HIPAA-equivalent processing addendum referenced.",
    payload: { commitment_type: "dpa_reference", deliberation: "clinical-imaging-pilot" } },
  { ts: "2026-05-03T17:30:00Z", kind: "commitment_signed", actor: "trinity-data/agent-002", target: "c-trinity-08",
    summary: "Web-archive opt-in finalized (18-month term).",
    payload: { commitment_type: "license_terms" } },
  { ts: "2026-05-02T14:50:00Z", kind: "policy_fired", actor: "policy-agent", target: "pol-8",
    summary: "Med-corpus HIPAA addendum policy flagged clinical-imaging-pilot until addendum was attached.",
    payload: { policy_id: "pol-8", action: "flag", commitment_id: "c-cip-1" } },
  { ts: "2026-05-02T09:14:00Z", kind: "transcript_turn", actor: "med-corpus/agent-003", target: "medical-journals-license#turn-44",
    summary: "med-corpus: Counter on §3 pricing impact incoming.",
    payload: { length: 38 } },
  { ts: "2026-05-01T22:11:00Z", kind: "agent_deployed", actor: "rj@mesa.dev", target: "legal-bot",
    summary: "Agent legal-bot redeployed with updated guardrails (v1.1.0).",
    payload: { model: "claude-opus-4-7", version: "1.1.0" } },
  { ts: "2026-04-30T17:00:00Z", kind: "agent_deployed", actor: "rj@mesa.dev", target: "redteam-agent",
    summary: "Agent redteam-agent deployed (v0.2.0) for adversarial counter-offer review.",
    payload: { model: "claude-opus-4-7", version: "0.2.0" } },
  { ts: "2026-04-29T11:25:00Z", kind: "commitment_signed", actor: "zenith/lumen", target: "c-zen-amend-2",
    summary: "Zenith image-corpus amendment §2 signed: revenue-share floor at $40k/yr.",
    payload: { commitment_type: "amendment", deliberation: "image-corpus-rev-share" } },
  { ts: "2026-04-27T15:42:00Z", kind: "policy_fired", actor: "policy-agent", target: "pol-4",
    summary: "Auto-approve renewals (publisher-co) cleared archive-renewal-2026 commitments c-arr-1 and c-arr-2.",
    payload: { policy_id: "pol-4", action: "flag", commitment_count: 2 } },
  { ts: "2026-04-25T10:08:00Z", kind: "transcript_turn", actor: "zenith/lumen", target: "image-corpus-rev-share#turn-3",
    summary: "zenith: Revenue share at 12% gross is firm; we can flex on the cap structure.",
    payload: { length: 45 } },
  { ts: "2026-04-23T16:55:00Z", kind: "agent_deployed", actor: "rj@mesa.dev", target: "intake-agent",
    summary: "Agent intake-agent deployed (v1.0.0) — RFP triage routing.",
    payload: { model: "claude-opus-4-7", version: "1.0.0" } },
  { ts: "2026-04-22T09:14:00Z", kind: "commitment_signed", actor: "publisher-co/lex", target: "c-prev-deal-final",
    summary: "Q1 archive license closed — final signoff and contract execution.",
    payload: { commitment_type: "signoff" } }
];

const events: AuditEvent[] = seeds.map((s, i) => ({
  id: `evt-${(seeds.length - i).toString().padStart(4, "0")}`,
  ts: s.ts,
  kind: s.kind,
  actor: s.actor,
  target: s.target,
  hash: h(i + 1),
  prevHash: i === seeds.length - 1 ? "0".repeat(12) : h(i + 2),
  summary: s.summary,
  payload: s.payload
}));

export function fixtureAuditEvents(): AuditEvent[] {
  return events;
}
