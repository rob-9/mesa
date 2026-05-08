import type { OrgSettings } from "./types";

const settings: OrgSettings = {
  name: "Mesa Labs",
  slug: "mesa-labs",
  defaultPack: "core",
  principals: [
    {
      id: "p-rj",
      name: "Robert Ji",
      role: "Ops",
      email: "rj@mesa.dev",
      keyFingerprint: "ed25519:lab1…aa00",
      addedAt: "2025-06-14T10:00:00Z"
    },
    {
      id: "p-mz",
      name: "M. Zhao",
      role: "Legal",
      email: "mz@mesa.dev",
      keyFingerprint: "ed25519:7fa1…b3c4",
      addedAt: "2026-05-04T11:45:00Z"
    },
    {
      id: "p-jr",
      name: "J. Reyes",
      role: "Commercial",
      email: "jr@mesa.dev",
      keyFingerprint: "ed25519:5b8c…ee31",
      addedAt: "2025-09-02T16:20:00Z"
    }
  ],
  packs: [
    {
      id: "core",
      version: "v1.4.0",
      fieldsCount: 14,
      description: "Offer / counter / amendment / approval / signoff base."
    },
    {
      id: "datasharing",
      version: "v0.9.2",
      fieldsCount: 9,
      description: "Scope, license terms, opt-out, usage restrictions, DPA reference."
    }
  ],
  integrations: [
    {
      id: "int-slack",
      name: "Slack",
      description: "Push flagged commitments to #deal-ops.",
      icon: "slack",
      connected: true
    },
    {
      id: "int-mail",
      name: "Email digests",
      description: "Daily summary of awaiting actions.",
      icon: "mail",
      connected: true
    },
    {
      id: "int-webhook",
      name: "Webhook",
      description: "POST every audit event to your endpoint.",
      icon: "webhook",
      connected: false
    }
  ]
};

export function fixtureOrgSettings(): OrgSettings {
  return settings;
}
