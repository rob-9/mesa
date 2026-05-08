"use client";

import { useEffect, useRef, useState } from "react";
import { Pill } from "@/components/primitives/Pill";
import { Icon } from "@/components/icons/Icon";
import type { Policy, PolicyAction, PolicyScope } from "@/lib/types";

const GRID = "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1.6fr) 90px 90px 56px";

export function PoliciesTable({ initial }: { initial: Policy[] }) {
  const [policies, setPolicies] = useState<Policy[]>(initial);
  const [panelOpen, setPanelOpen] = useState(false);

  function toggle(id: string) {
    setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  }

  function addPolicy(p: Omit<Policy, "id" | "hits30d">) {
    const id = `pol-${Date.now().toString(36)}`;
    setPolicies((prev) => [{ ...p, id, hits30d: 0 }, ...prev]);
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "var(--fg-5)" }}>
          {policies.filter((p) => p.enabled).length} of {policies.length} enabled
        </div>
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            height: 28,
            padding: "0 12px",
            background: "var(--accent)",
            color: "var(--bg)",
            border: "none",
            borderRadius: "var(--r-pill)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer"
          }}
        >
          <Icon name="plus" size={12} /> New policy
        </button>
      </div>

      <div
        style={{
          background: "var(--surface-0)",
          border: "1px solid var(--surface-2)",
          borderRadius: "var(--r-card)",
          overflow: "hidden"
        }}
      >
        <div
          className="mono"
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            gap: 14,
            padding: "12px 20px",
            fontSize: 11,
            color: "var(--fg-5)",
            letterSpacing: "0.06em",
            borderBottom: "1px solid var(--surface-2)"
          }}
        >
          <span>NAME</span>
          <span>SCOPE</span>
          <span>CONDITION</span>
          <span>ACTION</span>
          <span style={{ textAlign: "right" }}>HITS 30D</span>
          <span style={{ textAlign: "right" }}>ON</span>
        </div>
        {policies.length === 0 && (
          <div role="status" style={{ padding: "32px 20px", textAlign: "center", color: "var(--fg-4)", fontSize: 13 }}>
            No policies yet. Click <span style={{ color: "var(--fg-2)" }}>New policy</span> to add the first rule.
          </div>
        )}
        {policies.map((p, i) => (
          <div
            key={p.id}
            onMouseEnter={(ev) => (ev.currentTarget.style.background = "var(--surface-1)")}
            onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              gap: 14,
              alignItems: "center",
              padding: "12px 20px",
              borderBottom: i === policies.length - 1 ? "none" : "1px solid var(--border-row)",
              fontSize: 13,
              opacity: p.enabled ? 1 : 0.55,
              transition: "background 100ms"
            }}
          >
            <span style={{ color: "var(--fg-0)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.name}
            </span>
            <span style={{ fontSize: 12, color: "var(--fg-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <ScopeChip scope={p.scope} />
            </span>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.condition}
            </span>
            <span><ActionPill action={p.action} routeTo={p.routeTo} /></span>
            <span className="mono" style={{ textAlign: "right", color: p.hits30d > 0 ? "var(--fg-1)" : "var(--fg-5)" }}>
              {p.hits30d}
            </span>
            <span style={{ display: "inline-flex", justifyContent: "flex-end" }}>
              <ToggleSwitch on={p.enabled} onChange={() => toggle(p.id)} label={`${p.enabled ? "Disable" : "Enable"} policy ${p.name}`} />
            </span>
          </div>
        ))}
      </div>

      {panelOpen && (
        <NewPolicyPanel
          onClose={() => setPanelOpen(false)}
          onSave={(p) => {
            addPolicy(p);
            setPanelOpen(false);
          }}
        />
      )}
    </>
  );
}

function ScopeChip({ scope }: { scope: PolicyScope }) {
  if (scope.kind === "global") return <Pill tone="soft">global</Pill>;
  if (scope.kind === "agent") return <Pill tone="neutral">agent · {scope.agentName}</Pill>;
  return <Pill tone="neutral">cp · {scope.counterpartyName}</Pill>;
}

function ActionPill({ action, routeTo }: { action: PolicyAction; routeTo?: string }) {
  const tone: Record<PolicyAction, Parameters<typeof Pill>[0]["tone"]> = {
    flag: "amber",
    block: "amber",
    route: "accent"
  };
  const label = action === "route" && routeTo ? `route → ${routeTo}` : action;
  return <Pill tone={tone[action]}>{label}</Pill>;
}

function ToggleSwitch({ on, onChange, label }: { on: boolean; onChange: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={on}
      aria-label={label ?? (on ? "Disable" : "Enable")}
      style={{
        width: 28,
        height: 16,
        padding: 0,
        borderRadius: 999,
        border: "1px solid var(--surface-2)",
        background: on ? "var(--accent)" : "var(--surface-2)",
        position: "relative",
        cursor: "pointer",
        transition: "background 120ms"
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 1,
          left: on ? 13 : 1,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "var(--bg)",
          transition: "left 120ms"
        }}
      />
    </button>
  );
}

function NewPolicyPanel({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (p: Omit<Policy, "id" | "hits30d">) => void;
}) {
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("");
  const [action, setAction] = useState<PolicyAction>("flag");
  const [routeTo, setRouteTo] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const canSave = name.trim().length > 0 && condition.trim().length > 0;

  useEffect(() => {
    firstFieldRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    onSave({
      name: name.trim(),
      scope: { kind: "global" },
      condition: condition.trim(),
      action,
      routeTo: action === "route" ? routeTo.trim() || "legal-bot" : undefined,
      enabled: true
    });
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 50,
        display: "flex",
        justifyContent: "flex-end"
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-policy-title"
        style={{
          width: 380,
          height: "100%",
          background: "var(--surface-1)",
          borderLeft: "1px solid var(--surface-2)",
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          overflowY: "auto"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 id="new-policy-title" style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--fg-0)" }}>New policy</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close new policy panel"
            style={{
              appearance: "none",
              background: "transparent",
              border: "none",
              color: "var(--fg-4)",
              cursor: "pointer",
              padding: 4
            }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>
        <Field label="Name">
          <input
            ref={firstFieldRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Quarterly review threshold"
            required
            style={inputStyle}
          />
        </Field>
        <Field label="Condition" hint="Expression over typed commitment fields. Mono.">
          <textarea
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="fee_total_usd > 100000"
            rows={3}
            required
            className="mono"
            style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical" }}
          />
        </Field>
        <Field label="Action">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as PolicyAction)}
            style={inputStyle}
          >
            <option value="flag">flag</option>
            <option value="block">block</option>
            <option value="route">route</option>
          </select>
        </Field>
        {action === "route" && (
          <Field label="Route to">
            <input
              value={routeTo}
              onChange={(e) => setRouteTo(e.target.value)}
              placeholder="legal-bot"
              style={inputStyle}
            />
          </Field>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={secondaryBtn}>Cancel</button>
          <button
            type="submit"
            disabled={!canSave}
            aria-disabled={!canSave}
            style={{
              ...primaryBtn,
              opacity: canSave ? 1 : 0.45,
              cursor: canSave ? "pointer" : "not-allowed"
            }}
          >
            Save policy
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span className="mono" style={{ fontSize: 11, letterSpacing: "0.06em", color: "var(--fg-5)" }}>
        {label.toUpperCase()}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11, color: "var(--fg-5)" }}>{hint}</span>}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  appearance: "none",
  width: "100%",
  padding: "8px 10px",
  background: "var(--surface-0)",
  border: "1px solid var(--surface-2)",
  borderRadius: 8,
  color: "var(--fg-0)",
  fontSize: 12,
  fontFamily: "inherit"
};

const primaryBtn: React.CSSProperties = {
  appearance: "none",
  height: 30,
  padding: "0 14px",
  background: "var(--accent)",
  color: "var(--bg)",
  border: "none",
  borderRadius: "var(--r-pill)",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer"
};

const secondaryBtn: React.CSSProperties = {
  appearance: "none",
  height: 30,
  padding: "0 14px",
  background: "transparent",
  color: "var(--fg-3)",
  border: "1px solid var(--surface-2)",
  borderRadius: "var(--r-pill)",
  fontSize: 12,
  cursor: "pointer"
};
