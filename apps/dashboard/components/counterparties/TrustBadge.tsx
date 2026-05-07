import type { TrustTier } from "@/lib/types";
import { Pill } from "@/components/primitives/Pill";

const tone: Record<TrustTier, Parameters<typeof Pill>[0]["tone"]> = {
  verified: "accent",
  standard: "neutral",
  watchlist: "amber"
};

const label: Record<TrustTier, string> = {
  verified: "verified",
  standard: "standard",
  watchlist: "watchlist"
};

export function TrustBadge({ tier }: { tier: TrustTier }) {
  return <Pill tone={tone[tier]}>{label[tier]}</Pill>;
}
