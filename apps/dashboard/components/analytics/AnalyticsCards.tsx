import { Pill } from "@/components/primitives/Pill";
import type { AnalyticsData } from "@/lib/types";

export function AnalyticsCards({ data }: { data: AnalyticsData }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 12
      }}
    >
      <ThroughputCard series={data.throughput14d} />
      <AutoResolveCard rate={data.autoResolveRate} trend={data.autoResolveTrend14d} />
      <TtrCard buckets={data.ttrBuckets} />
      <PolicyFiresCard fires={data.policyFires} />
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "16px 18px",
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minWidth: 0
      }}
    >
      <div>
        <div className="mono" style={{ fontSize: 11, color: "var(--fg-5)", letterSpacing: "0.06em" }}>
          {title.toUpperCase()}
        </div>
        {subtitle && <div style={{ marginTop: 4, fontSize: 12, color: "var(--fg-4)" }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function ThroughputCard({ series }: { series: number[] }) {
  const max = Math.max(...series, 1);
  const w = 320;
  const h = 64;
  const step = w / (series.length - 1);
  const points = series
    .map((v, i) => `${(i * step).toFixed(2)},${(h - (v / max) * h).toFixed(2)}`)
    .join(" ");
  const total = series.reduce((s, v) => s + v, 0);
  return (
    <Card title="Throughput" subtitle="Deliberations resolved · 14 days">
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span className="mono" style={{ fontSize: 26, fontWeight: 600, color: "var(--fg-0)", letterSpacing: "-0.02em", lineHeight: 1 }}>
          {total}
        </span>
        <span style={{ fontSize: 12, color: "var(--fg-5)" }}>resolved · last 14d</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: "block" }}>
        <polyline
          points={points}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {series.map((v, i) => (
          <circle key={i} cx={(i * step).toFixed(2)} cy={(h - (v / max) * h).toFixed(2)} r={1.6} fill="var(--accent)" />
        ))}
      </svg>
    </Card>
  );
}

function AutoResolveCard({ rate, trend }: { rate: string; trend: number[] }) {
  const w = 220;
  const h = 40;
  const step = w / (trend.length - 1);
  const points = trend
    .map((v, i) => `${(i * step).toFixed(2)},${(h - v * h).toFixed(2)}`)
    .join(" ");
  return (
    <Card title="Auto-resolution rate" subtitle="Share resolved without human review">
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span className="mono" style={{ fontSize: 32, fontWeight: 600, color: "var(--fg-0)", letterSpacing: "-0.025em", lineHeight: 1 }}>
          {rate}
        </span>
        <span style={{ fontSize: 12, color: "var(--fg-5)" }}>14-day rolling</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: "block" }}>
        <polyline
          points={points}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Card>
  );
}

function TtrCard({ buckets }: { buckets: { label: string; count: number }[] }) {
  const max = Math.max(...buckets.map((b) => b.count), 1);
  return (
    <Card title="Time to resolution" subtitle="Distribution across closed deliberations">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 100 }}>
        {buckets.map((b) => {
          const pct = (b.count / max) * 100;
          return (
            <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                <div
                  style={{
                    width: "100%",
                    height: `${pct}%`,
                    background: "var(--accent-soft)",
                    borderTop: "2px solid var(--accent)",
                    borderRadius: "4px 4px 0 0"
                  }}
                />
              </div>
              <span className="mono" style={{ fontSize: 11, color: "var(--fg-1)" }}>{b.count}</span>
              <span style={{ fontSize: 10, color: "var(--fg-5)", textAlign: "center", whiteSpace: "nowrap" }}>{b.label}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PolicyFiresCard({ fires }: { fires: AnalyticsData["policyFires"] }) {
  const max = Math.max(...fires.map((f) => f.count), 1);
  const total = fires.reduce((s, f) => s + f.count, 0);
  return (
    <Card title="Policy fires by kind" subtitle={`${total} fires · last 30 days`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {fires.map((f) => {
          const pct = (f.count / max) * 100;
          const bar =
            f.tone === "accent" ? "var(--accent)" :
            f.tone === "amber"  ? "var(--amber)"  :
                                  "var(--fg-5)";
          const soft =
            f.tone === "accent" ? "var(--accent-soft)" :
            f.tone === "amber"  ? "var(--amber-soft)"  :
                                  "var(--surface-2)";
          return (
            <div key={f.kind} style={{ display: "grid", gridTemplateColumns: "120px 1fr 30px", alignItems: "center", gap: 10, fontSize: 12 }}>
              <span style={{ color: "var(--fg-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.kind}
              </span>
              <div style={{ height: 8, borderRadius: 4, background: soft, position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: bar, borderRadius: 4 }} />
              </div>
              <span className="mono" style={{ textAlign: "right", color: "var(--fg-1)" }}>{f.count}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 4 }}>
        <Pill tone="soft">demo data</Pill>
      </div>
    </Card>
  );
}
