"use client";

import { useState } from "react";
import Link from "next/link";
import { Pill } from "@/components/primitives/Pill";
import { Tabs, type TabSpec } from "@/components/agents/Tabs";
import { Icon } from "@/components/icons/Icon";
import { formatRelative } from "@/lib/format";
import type { Counterparty, Deliberation, Commitment } from "@/lib/types";

interface Props {
  counterparty: Counterparty;
  deliberations: Deliberation[];
  commitments: { commitment: Commitment; deliberationId: string; deliberationTitle: string }[];
  firstDeliberationLabel: string;
}

export function CounterpartyTabsContent({
  counterparty,
  deliberations,
  commitments,
  firstDeliberationLabel
}: Props) {
  const tabs: TabSpec[] = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <OverviewTab
          counterparty={counterparty}
          deliberationsCount={deliberations.length}
          commitmentsCount={commitments.length}
          firstDeliberationLabel={firstDeliberationLabel}
        />
      )
    },
    {
      id: "deliberations",
      label: "Deliberations",
      count: deliberations.length,
      content: <DeliberationsTab deliberations={deliberations} />
    },
    {
      id: "commitments",
      label: "Commitments",
      count: commitments.length,
      content: <CommitmentsTab commitments={commitments} />
    },
    {
      id: "identity",
      label: "Identity",
      count: counterparty.principals.length,
      content: <IdentityTab counterparty={counterparty} />
    }
  ];

  return <Tabs tabs={tabs} />;
}

function KpiTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: "var(--surface-0)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)"
      }}
    >
      <div className="mono" style={{ fontSize: 22, fontWeight: 600, color: "var(--fg-0)", letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: "var(--fg-5)" }}>{label}</div>
    </div>
  );
}

function OverviewTab({
  counterparty,
  deliberationsCount,
  commitmentsCount,
  firstDeliberationLabel
}: {
  counterparty: Counterparty;
  deliberationsCount: number;
  commitmentsCount: number;
  firstDeliberationLabel: string;
}) {
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 10
        }}
      >
        <KpiTile value={deliberationsCount} label="active deliberations" />
        <KpiTile value={commitmentsCount} label="total commitments" />
        <KpiTile value={firstDeliberationLabel} label="first seen" />
        <KpiTile value={counterparty.schemas.length} label="schemas in use" />
      </div>
      <div>
        <div className="mono" style={{ fontSize: 11, color: "var(--fg-5)", letterSpacing: "0.06em", marginBottom: 8 }}>
          SCHEMAS IN USE
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {counterparty.schemas.map((s) => (
            <Pill key={s} tone="soft">{s}</Pill>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeliberationsTab({ deliberations }: { deliberations: Deliberation[] }) {
  if (deliberations.length === 0) {
    return <EmptyState>No deliberations recorded yet.</EmptyState>;
  }
  return (
    <div>
      {deliberations.map((d, i) => (
        <Link
          key={d.id}
          href={`/deliberations/${d.id}`}
          className="row-link"
          style={{
            display: "block",
            padding: "14px 20px",
            borderBottom: i === deliberations.length - 1 ? "none" : "1px solid var(--border-row)",
            textDecoration: "none",
            color: "inherit"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--fg-0)", fontSize: 13, fontWeight: 500, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {d.title}
            </span>
            <Pill tone={d.flagged ? "amber" : "soft"}>{d.stage}</Pill>
            <span className="mono" style={{ color: "var(--fg-5)", fontSize: 11, width: 60, textAlign: "right" }}>
              {d.commitmentCount} cmts
            </span>
            <span className="mono" style={{ color: "var(--fg-4)", fontSize: 11, width: 50, textAlign: "right" }}>
              {formatRelative(d.lastActivity)}
            </span>
          </div>
          <div style={{ marginTop: 4, color: "var(--fg-4)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {d.latestSummary}
          </div>
        </Link>
      ))}
    </div>
  );
}

function CommitmentsTab({
  commitments
}: {
  commitments: { commitment: Commitment; deliberationId: string; deliberationTitle: string }[];
}) {
  if (commitments.length === 0) {
    return <EmptyState>No commitments yet.</EmptyState>;
  }
  return (
    <div>
      {commitments.map((row, i) => (
        <Link
          key={row.commitment.id}
          href={`/deliberations/${row.deliberationId}`}
          className="row-link"
          style={{
            display: "block",
            padding: "12px 20px",
            borderBottom: i === commitments.length - 1 ? "none" : "1px solid var(--border-row)",
            textDecoration: "none",
            color: "inherit"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="mono" style={{ color: "var(--fg-5)", fontSize: 11, width: 110 }}>
              {row.commitment.type}
            </span>
            <span style={{ flex: 1, minWidth: 0, color: "var(--fg-1)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {row.commitment.summary}
            </span>
            <Pill tone={statusTone(row.commitment.status)}>{row.commitment.status}</Pill>
            <span className="mono" style={{ color: "var(--fg-5)", fontSize: 11 }}>
              {formatRelative(row.commitment.createdAt)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function statusTone(s: Commitment["status"]): Parameters<typeof Pill>[0]["tone"] {
  switch (s) {
    case "accepted": return "accent";
    case "pending":  return "neutral";
    case "flagged":  return "amber";
    case "rejected": return "amber";
  }
}

function IdentityTab({ counterparty }: { counterparty: Counterparty }) {
  const [copied, setCopied] = useState<string | null>(null);
  function copy(text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1200);
    }
  }
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="mono" style={{ fontSize: 11, color: "var(--fg-5)", letterSpacing: "0.06em" }}>
        PRINCIPALS · {counterparty.principals.length}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {counterparty.principals.map((p) => (
          <div
            key={p.keyFingerprint}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              background: "var(--surface-0)",
              border: "1px solid var(--surface-2)",
              borderRadius: "var(--r-card)"
            }}
          >
            <Icon name="key" size={14} />
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, color: "var(--fg-0)" }}>
                {p.name}
                {p.role && <span style={{ color: "var(--fg-5)", marginLeft: 8, fontSize: 12 }}>· {p.role}</span>}
              </span>
              <span className="mono" style={{ fontSize: 11, color: "var(--fg-4)" }}>
                {p.keyFingerprint}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copy(p.keyFingerprint)}
              className="nav-item"
              style={{
                appearance: "none",
                background: "transparent",
                border: "1px solid var(--surface-2)",
                color: "var(--fg-4)",
                borderRadius: "var(--r-pill)",
                fontSize: 11,
                padding: "4px 10px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5
              }}
            >
              <Icon name="copy" size={11} />
              {copied === p.keyFingerprint ? "copied" : "copy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--fg-5)", fontSize: 12 }}>
      {children}
    </div>
  );
}
