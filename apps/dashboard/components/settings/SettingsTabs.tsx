"use client";

import { useState } from "react";
import { Pill } from "@/components/primitives/Pill";
import { Tabs, type TabSpec } from "@/components/agents/Tabs";
import { Icon } from "@/components/icons/Icon";
import type { OrgSettings, IntegrationTile, OrgPrincipal, VerticalPack } from "@/lib/types";

export function SettingsTabs({ settings }: { settings: OrgSettings }) {
  const tabs: TabSpec[] = [
    { id: "org",         label: "Organization", content: <OrganizationTab settings={settings} /> },
    { id: "identity",    label: "Identity",     count: settings.principals.length, content: <IdentityTab principals={settings.principals} /> },
    { id: "schemas",     label: "Schemas",      count: settings.packs.length,      content: <SchemasTab packs={settings.packs} defaultPack={settings.defaultPack} /> },
    { id: "integrations", label: "Integrations", count: settings.integrations.filter((i) => i.connected).length, content: <IntegrationsTab tiles={settings.integrations} /> }
  ];
  return <Tabs tabs={tabs} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="mono" style={{ fontSize: 11, color: "var(--fg-5)", letterSpacing: "0.06em" }}>
        {title.toUpperCase()}
      </div>
      {children}
    </div>
  );
}

function OrganizationTab({ settings }: { settings: OrgSettings }) {
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18, maxWidth: 640 }}>
      <Section title="Org info">
        <KvField label="name" value={settings.name} />
        <KvField label="slug" value={settings.slug} mono />
        <KvField label="default schema pack" value={settings.defaultPack} mono />
      </Section>
      <Section title="Logo">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 14,
            background: "var(--surface-0)",
            border: "1px dashed var(--surface-2)",
            borderRadius: "var(--r-card)"
          }}
        >
          <span
            aria-hidden
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--accent), #b25a3f)",
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "var(--fg-1)" }}>mesa-logo.svg</div>
            <div style={{ fontSize: 11, color: "var(--fg-5)" }}>2.4 KB · uploaded 2025-06-14</div>
          </div>
          <button type="button" style={secondaryBtn}>Replace</button>
        </div>
      </Section>
    </div>
  );
}

function IdentityTab({ principals }: { principals: OrgPrincipal[] }) {
  const [list, setList] = useState(principals);
  function add() {
    const id = `p-${Date.now().toString(36)}`;
    setList((prev) => [
      ...prev,
      {
        id,
        name: "New principal",
        role: "—",
        email: "user@mesa.dev",
        keyFingerprint: `ed25519:new${id.slice(-4)}…0000`,
        addedAt: new Date().toISOString()
      }
    ]);
  }
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--fg-5)", letterSpacing: "0.06em" }}>
          PRINCIPALS · {list.length}
        </span>
        <button type="button" onClick={add} style={primaryBtn}>
          <Icon name="plus" size={11} /> Add principal
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((p) => (
          <div
            key={p.id}
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
                <span style={{ color: "var(--fg-5)", marginLeft: 8, fontSize: 12 }}>· {p.role}</span>
                <span style={{ color: "var(--fg-5)", marginLeft: 8, fontSize: 12 }}>· {p.email}</span>
              </span>
              <span className="mono" style={{ fontSize: 11, color: "var(--fg-4)" }}>
                {p.keyFingerprint}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SchemasTab({ packs, defaultPack }: { packs: VerticalPack[]; defaultPack: string }) {
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
      <span className="mono" style={{ fontSize: 11, color: "var(--fg-5)", letterSpacing: "0.06em" }}>
        VERTICAL PACKS · {packs.length}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {packs.map((p) => (
          <div
            key={p.id}
            style={{
              padding: "12px 14px",
              background: "var(--surface-0)",
              border: "1px solid var(--surface-2)",
              borderRadius: "var(--r-card)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-0)" }}>{p.id}</span>
              <Pill tone="soft">{p.version}</Pill>
              {p.id === defaultPack && <Pill tone="accent">default</Pill>}
              <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--fg-5)" }}>
                {p.fieldsCount} fields
              </span>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--fg-4)" }}>{p.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationsTab({ tiles }: { tiles: IntegrationTile[] }) {
  const [list, setList] = useState(tiles);
  function toggle(id: string) {
    setList((prev) => prev.map((t) => (t.id === id ? { ...t, connected: !t.connected } : t)));
  }
  return (
    <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
      {list.map((t) => (
        <div
          key={t.id}
          style={{
            padding: "14px 16px",
            background: "var(--surface-0)",
            border: "1px solid var(--surface-2)",
            borderRadius: "var(--r-card)",
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "var(--surface-2)",
                color: "var(--fg-1)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Icon name={t.icon} size={14} />
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-0)" }}>{t.name}</span>
            {t.connected && <Pill tone="accent">connected</Pill>}
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-4)" }}>{t.description}</div>
          <button type="button" onClick={() => toggle(t.id)} style={t.connected ? secondaryBtn : primaryBtn}>
            {t.connected ? "Disconnect" : "Connect"}
          </button>
        </div>
      ))}
    </div>
  );
}

function KvField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13 }}>
      <span style={{ width: 160, color: "var(--fg-5)", fontSize: 12 }}>{label}</span>
      <span className={mono ? "mono" : undefined} style={{ color: "var(--fg-1)" }}>
        {value}
      </span>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  appearance: "none",
  height: 28,
  padding: "0 12px",
  background: "var(--accent)",
  color: "var(--bg)",
  border: "none",
  borderRadius: "var(--r-pill)",
  fontSize: 11,
  fontWeight: 500,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 5
};

const secondaryBtn: React.CSSProperties = {
  appearance: "none",
  height: 28,
  padding: "0 12px",
  background: "transparent",
  color: "var(--fg-3)",
  border: "1px solid var(--surface-2)",
  borderRadius: "var(--r-pill)",
  fontSize: 11,
  cursor: "pointer"
};
