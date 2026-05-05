import type { Stage } from "@/lib/types";
import { Pill } from "./Pill";

interface StagePillProps {
  stage: Stage;
  flagged: boolean;
  // When true, the stage pill is rendered as the "current phase" affordance
  // (accent tone). When false, neutral. Detail headers use current=true; rows
  // typically use current=true so the table reads as "where each deal is now".
  current?: boolean;
}

export function StagePill({ stage, flagged, current = true }: StagePillProps) {
  // Flagged precedence rule from the spec: amber wins over stage.
  if (flagged) {
    return <Pill tone="amber">flagged</Pill>;
  }
  return <Pill tone={current ? "accent" : "neutral"}>{stage}</Pill>;
}
