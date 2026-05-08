"use client";

import { useState } from "react";
import type { OverviewData } from "@/lib/types";
import { ActivityTable } from "./ActivityTable";
import {
  OverviewFilterStrip,
  type KpiFilter,
  type StateFilter
} from "./OverviewFilterStrip";
import { OverviewSearchBar } from "./OverviewSearchBar";
import { TopAgentsRow } from "./TopAgentsRow";

export function OverviewBody({ data }: { data: OverviewData }) {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const [kpiFilter, setKpiFilter] = useState<KpiFilter>("none");

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}
    >
      <OverviewSearchBar value={query} onChange={setQuery} />
      <OverviewFilterStrip
        risk={data.risk}
        integrations={data.integrations}
        stateFilter={stateFilter}
        kpiFilter={kpiFilter}
        onStateFilter={setStateFilter}
        onKpiFilter={setKpiFilter}
        onClear={() => {
          setStateFilter("all");
          setKpiFilter("none");
        }}
      />
      <TopAgentsRow agents={data.agents} />
      <ActivityTable
        agents={data.agents}
        events={data.events}
        integrations={data.integrations}
        globalQuery={query}
        stateFilter={stateFilter}
        kpiFilter={kpiFilter}
      />
    </div>
  );
}
