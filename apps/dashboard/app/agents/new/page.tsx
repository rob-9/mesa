"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PostDeployConnect } from "@/components/deploy/PostDeployConnect";
import { StepCapabilities } from "@/components/deploy/StepCapabilities";
import { StepConnections } from "@/components/deploy/StepConnections";
import { StepIdentity } from "@/components/deploy/StepIdentity";
import { StepPolicies } from "@/components/deploy/StepPolicies";
import { StepReview } from "@/components/deploy/StepReview";
import { WizardShell } from "@/components/deploy/WizardShell";
import type { WizardState } from "@/components/deploy/types";
import { Select } from "@/components/primitives/Select";
import { AppShell } from "@/components/shell/AppShell";
import { deployAgent } from "@/lib/api";
import { findAgentTemplate, listAgentTemplates, templateToWizardState } from "@/lib/agent-templates";

const STEPS = [
  { id: "identity", label: "Identity" },
  { id: "capabilities", label: "Capabilities" },
  { id: "connections", label: "Connections" },
  { id: "policies", label: "Policies" },
  { id: "review", label: "Review" }
];

const BLANK_TEMPLATE = "__blank__";

const initial: WizardState = {
  name: "",
  role: "",
  model: "claude-opus-4-7",
  persona: "",
  owner: "rj@mesa.dev",
  capabilities: [],
  connections: [],
  policies: []
};

type Phase = "wizard" | "connect";

export default function DeployAgentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(initial);
  const [deploying, setDeploying] = useState(false);
  const [phase, setPhase] = useState<Phase>("wizard");
  const [deployedSnapshot, setDeployedSnapshot] = useState<WizardState | null>(null);
  const [templateId, setTemplateId] = useState<string>(BLANK_TEMPLATE);

  const templateOptions = useMemo(() => {
    const list = listAgentTemplates().map((t) => ({
      value: t.id,
      label: `${t.name} · ${t.role}`
    }));
    return [{ value: BLANK_TEMPLATE, label: "Start from blank" }, ...list];
  }, []);

  const onTemplateChange = (id: string) => {
    setTemplateId(id);
    if (id === BLANK_TEMPLATE) {
      setState(initial);
      setStep(0);
      return;
    }
    const tpl = findAgentTemplate(id);
    if (tpl) {
      setState(templateToWizardState(tpl));
      // Templates pre-fill every section, so jump straight to Review.
      setStep(STEPS.length - 1);
    }
  };

  const stepValid = (s: number): boolean => {
    if (s === 0) return state.name.trim().length > 0 && state.role.trim().length > 0;
    if (s === 1) return state.capabilities.length > 0;
    return true;
  };

  const onDeploy = async () => {
    if (deploying) return;
    setDeploying(true);
    try {
      await deployAgent(state);
      setDeployedSnapshot(state);
      setPhase("connect");
    } catch (err) {
      setDeploying(false);
      throw err;
    }
  };

  const onConnectComplete = () => {
    router.push(`/deliberations/training-data-q4?live=1`);
  };

  const isLast = step === STEPS.length - 1;

  return (
    <AppShell>
      <div style={{ marginBottom: 18 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.015em",
            color: "var(--fg-0)"
          }}
        >
          Deploy Agent
        </h1>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--fg-4)" }}>
          Bring an internal agent onto the platform with the systems and guardrails it needs.
        </div>
      </div>

      {phase === "wizard" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 18,
            padding: "12px 14px",
            background: "var(--surface-0)",
            border: "1px solid var(--surface-2)",
            borderRadius: "var(--r-card)"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span
              className="mono"
              style={{ fontSize: 11, color: "var(--fg-4)", letterSpacing: "0.06em" }}
            >
              START FROM EXISTING AGENT
            </span>
            <span style={{ fontSize: 12, color: "var(--fg-5)" }}>
              Pre-fills every section from a saved configuration. Lands you on Review — edit anything or hit Deploy.
            </span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ minWidth: 280 }}>
              <Select
                value={templateId}
                onChange={onTemplateChange}
                options={templateOptions}
              />
            </div>
          </div>
        </div>
      )}

      {phase === "wizard" && (
        <WizardShell
          steps={STEPS}
          current={step}
          onPrev={step > 0 ? () => setStep(step - 1) : undefined}
          onNext={isLast ? onDeploy : () => setStep(step + 1)}
          nextLabel={isLast ? (deploying ? "Deploying…" : "Deploy") : "Continue"}
          nextDisabled={!stepValid(step) || (isLast && deploying)}
        >
          {step === 0 && <StepIdentity state={state} setState={setState} />}
          {step === 1 && <StepCapabilities state={state} setState={setState} />}
          {step === 2 && <StepConnections state={state} setState={setState} />}
          {step === 3 && <StepPolicies state={state} setState={setState} />}
          {step === 4 && <StepReview state={state} goToStep={setStep} />}
        </WizardShell>
      )}

      {phase === "connect" && deployedSnapshot && (
        <PostDeployConnect
          deployedAgent={deployedSnapshot}
          onComplete={onConnectComplete}
        />
      )}
    </AppShell>
  );
}
