import type { Policy } from "./types";

const policies: Policy[] = [
  {
    id: "pol-1",
    name: "Term cap (license deals)",
    scope: { kind: "global" },
    condition: "term_months > 36",
    action: "flag",
    hits30d: 4,
    enabled: true
  },
  {
    id: "pol-2",
    name: "Spend cap per deliberation",
    scope: { kind: "global" },
    condition: "fee_total_usd > 250000",
    action: "block",
    hits30d: 1,
    enabled: true
  },
  {
    id: "pol-3",
    name: "Watchlist counterparty review",
    scope: { kind: "counterparty", counterpartySlug: "curio-press", counterpartyName: "Curio Press" },
    condition: "any signoff",
    action: "route",
    routeTo: "legal-bot",
    hits30d: 2,
    enabled: true
  },
  {
    id: "pol-4",
    name: "Auto-approve renewals",
    scope: { kind: "counterparty", counterpartySlug: "publisher-co", counterpartyName: "Publisher Co." },
    condition: "renewal && fee_total_usd < 50000",
    action: "flag",
    hits30d: 7,
    enabled: true
  },
  {
    id: "pol-5",
    name: "PII presence check",
    scope: { kind: "global" },
    condition: "scope.includes('PII') && !dpa_attached",
    action: "block",
    hits30d: 0,
    enabled: true
  },
  {
    id: "pol-6",
    name: "Lab buyer agent — pricing latitude",
    scope: { kind: "agent", agentId: "lab-buyer-agent", agentName: "lab-buyer-agent" },
    condition: "discount_pct > 25",
    action: "flag",
    hits30d: 3,
    enabled: true
  },
  {
    id: "pol-7",
    name: "Weekend signoff freeze",
    scope: { kind: "global" },
    condition: "weekday(now) in (sat, sun)",
    action: "flag",
    hits30d: 0,
    enabled: false
  },
  {
    id: "pol-8",
    name: "Med-corpus HIPAA addendum required",
    scope: { kind: "counterparty", counterpartySlug: "med-corpus", counterpartyName: "Med Corpus" },
    condition: "!hipaa_addendum_attached",
    action: "block",
    hits30d: 1,
    enabled: true
  }
];

export function fixturePolicies(): Policy[] {
  return policies;
}
