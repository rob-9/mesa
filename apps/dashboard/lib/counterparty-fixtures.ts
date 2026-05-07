import { fixtureDashboard } from "./fixtures";
import type { Counterparty } from "./types";

const counterparties: Counterparty[] = [
  {
    slug: "publisher-co",
    name: "Publisher Co.",
    domain: "publisher.example",
    trustTier: "verified",
    principals: [
      { name: "M. Sato",     role: "legal",      keyFingerprint: "ed25519:7f4c…a921" },
      { name: "D. Khurana",  role: "commercial", keyFingerprint: "ed25519:91a3…0f2b" }
    ],
    schemas: ["core", "datasharing"],
    firstDeliberationAt: "2025-09-12T10:14:00Z",
    notes: "GDPR-compliant DPA on file. Auto-approve renewals < $50k."
  },
  {
    slug: "trinity-data",
    name: "Trinity Data",
    domain: "trinity-data.example",
    trustTier: "verified",
    principals: [
      { name: "L. Ortiz", role: "ops", keyFingerprint: "ed25519:34bd…77c9" }
    ],
    schemas: ["core", "datasharing"],
    firstDeliberationAt: "2025-11-04T18:22:00Z"
  },
  {
    slug: "zenith",
    name: "Zenith Imagery",
    domain: "zenith.example",
    trustTier: "standard",
    principals: [
      { name: "P. Wei", role: "commercial", keyFingerprint: "ed25519:c19f…48ee" },
      { name: "R. Foley", keyFingerprint: "ed25519:ad05…1133" }
    ],
    schemas: ["core"],
    firstDeliberationAt: "2026-02-19T09:01:00Z",
    notes: "Pricing terms typically negotiated by humans — flag offers > $100k."
  },
  {
    slug: "octostack",
    name: "Octostack",
    domain: "octostack.example",
    trustTier: "standard",
    principals: [
      { name: "T. Nakamura", role: "legal", keyFingerprint: "ed25519:6622…9d4f" }
    ],
    schemas: ["core"],
    firstDeliberationAt: "2026-03-08T14:00:00Z"
  },
  {
    slug: "curio-press",
    name: "Curio Press",
    domain: "curio.example",
    trustTier: "watchlist",
    principals: [
      { name: "S. Marks", role: "legal", keyFingerprint: "ed25519:fa11…02bb" }
    ],
    schemas: ["datasharing"],
    firstDeliberationAt: "2026-01-22T11:48:00Z",
    notes: "Open dispute on speaker-attribution scope. Block any signoff until legal sign-off."
  },
  {
    slug: "med-corpus",
    name: "Med Corpus",
    domain: "med-corpus.example",
    trustTier: "verified",
    principals: [
      { name: "A. Patel", role: "legal", keyFingerprint: "ed25519:2298…44a0" },
      { name: "K. Liang", role: "ops",   keyFingerprint: "ed25519:ee70…91c8" }
    ],
    schemas: ["core", "datasharing"],
    firstDeliberationAt: "2025-07-30T08:10:00Z",
    notes: "HIPAA-equivalent processing addendum required for all engagements."
  }
];

export function fixtureCounterparties(): Counterparty[] {
  return counterparties;
}

export function fixtureCounterparty(slug: string): Counterparty | null {
  return counterparties.find((c) => c.slug === slug) ?? null;
}

// Roll-ups computed from existing deliberation/commitment fixtures.
// Used by both the directory and the per-counterparty detail page.
export interface CounterpartyRollup {
  slug: string;
  activeDeals: number;
  totalCommitments: number;
  lastActivity: string | null;
}

export function fixtureCounterpartyRollups(): Record<string, CounterpartyRollup> {
  const dash = fixtureDashboard();
  const out: Record<string, CounterpartyRollup> = {};
  for (const c of counterparties) {
    const myDeliberations = dash.deliberations.filter((d) => d.counterparty === c.slug);
    const totalCommitments = myDeliberations.reduce((sum, d) => sum + d.commitmentCount, 0);
    const lastActivity = myDeliberations.length
      ? myDeliberations
          .map((d) => d.lastActivity)
          .sort()
          .at(-1) ?? null
      : null;
    out[c.slug] = {
      slug: c.slug,
      activeDeals: myDeliberations.length,
      totalCommitments,
      lastActivity
    };
  }
  return out;
}
