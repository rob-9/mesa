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
  { ts: "2026-05-05T16:00:00Z", kind: "commitment_signed", actor: "publisher-co/agent-001", target: "c-tdq4-8",
    summary: "DPA reference (publisher-co standard, GDPR-compliant) signed.",
    payload: { commitment_type: "dpa_reference", deliberation: "training-data-q4" } },
  { ts: "2026-05-05T15:55:00Z", kind: "commitment_signed", actor: "lab-buyer-agent", target: "c-tdq4-7",
    summary: "Usage restriction signed: no resale of derivative weights.",
    payload: { commitment_type: "usage_restriction" } },
  { ts: "2026-05-05T15:42:00Z", kind: "policy_fired", actor: "policy-agent", target: "pol-1",
    summary: "Term cap policy flagged term_months=24 (within tolerance, info-only).",
    payload: { policy_id: "pol-1", action: "flag", commitment_id: "c-tdq4-2" } },
  { ts: "2026-05-05T14:10:00Z", kind: "commitment_signed", actor: "lab-buyer-agent", target: "c-tdq4-3",
    summary: "Scope amendment: translated articles excluded.",
    payload: { commitment_type: "amendment" } },
  { ts: "2026-05-05T13:00:00Z", kind: "agent_deployed", actor: "rj@summer.dev", target: "policy-agent",
    summary: "Agent policy-agent deployed (v0.4.2).",
    payload: { model: "claude-opus-4-7", version: "0.4.2" } },
  { ts: "2026-05-04T11:45:00Z", kind: "principal_added", actor: "rj@summer.dev", target: "principal-mz",
    summary: "Principal M. Zhao (legal) added with key ed25519:7fa1…b3c4.",
    payload: { fingerprint: "ed25519:7fa1…b3c4" } },
  { ts: "2026-05-04T10:02:00Z", kind: "policy_fired", actor: "policy-agent", target: "pol-3",
    summary: "Watchlist policy routed curio-press signoff to legal-bot.",
    payload: { policy_id: "pol-3", action: "route", route_to: "legal-bot" } },
  { ts: "2026-05-03T17:30:00Z", kind: "commitment_signed", actor: "trinity-data/agent-002", target: "c-trinity-08",
    summary: "Web-archive opt-in finalized (18-month term).",
    payload: { commitment_type: "license_terms" } },
  { ts: "2026-05-02T09:14:00Z", kind: "transcript_turn", actor: "med-corpus/agent-003", target: "medical-journals-license#turn-44",
    summary: "med-corpus: Counter on §3 pricing impact incoming.",
    payload: { length: 38 } },
  { ts: "2026-05-01T22:11:00Z", kind: "agent_deployed", actor: "rj@summer.dev", target: "legal-bot",
    summary: "Agent legal-bot redeployed with updated guardrails (v1.1.0).",
    payload: { model: "claude-opus-4-7", version: "1.1.0" } }
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
