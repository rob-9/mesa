import type { AnalyticsData } from "./types";

const data: AnalyticsData = {
  // Last 14 days, oldest first.
  throughput14d: [3, 5, 4, 7, 6, 8, 5, 9, 7, 8, 6, 11, 9, 12],
  autoResolveRate: "89%",
  autoResolveTrend14d: [0.78, 0.81, 0.84, 0.83, 0.85, 0.82, 0.87, 0.86, 0.88, 0.9, 0.87, 0.91, 0.89, 0.89],
  ttrBuckets: [
    { label: "<1h", count: 28 },
    { label: "1-4h", count: 41 },
    { label: "4-12h", count: 19 },
    { label: "12-24h", count: 7 },
    { label: "1-3d", count: 4 },
    { label: ">3d", count: 1 }
  ],
  policyFires: [
    { kind: "term cap",            count: 14, tone: "neutral" },
    { kind: "spend cap",           count: 6,  tone: "amber" },
    { kind: "watchlist review",    count: 5,  tone: "amber" },
    { kind: "auto-approve renewal", count: 11, tone: "accent" },
    { kind: "PII presence",        count: 2,  tone: "amber" },
    { kind: "agent latitude",      count: 9,  tone: "neutral" },
    { kind: "HIPAA addendum",      count: 1,  tone: "amber" }
  ]
};

export function fixtureAnalytics(): AnalyticsData {
  return data;
}
