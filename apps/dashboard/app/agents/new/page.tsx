"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StepCapabilities } from "@/components/deploy/StepCapabilities";
import { StepConnections } from "@/components/deploy/StepConnections";
import { StepIdentity } from "@/components/deploy/StepIdentity";
import { StepPolicies } from "@/components/deploy/StepPolicies";
import { StepReview } from "@/components/deploy/StepReview";
import { WizardShell } from "@/components/deploy/WizardShell";
import type { WizardState } from "@/components/deploy/types";
import { AppShell } from "@/components/shell/AppShell";
import { deployAgent } from "@/lib/api";

const STEPS = [
  { id: "identity", label: "Identity" },
  { id: "capabilities", label: "Capabilities" },
  { id: "connections", label: "Connections" },
  { id: "policies", label: "Policies" },
  { id: "review", label: "Review" }
];

const initial: WizardState = {
  name: "",
  role: "",
  model: "claude-opus-4-7",
  persona: "",
  owner: "rj@summer.dev",
  capabilities: [],
  connections: [],
  policies: []
};

export default function DeployAgentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(initial);
  const [deploying, setDeploying] = useState(false);

  const stepValid = (s: number): boolean => {
    if (s === 0) return state.name.trim().length > 0 && state.role.trim().length > 0;
    if (s === 1) return state.capabilities.length > 0;
    return true;
  };

  const onDeploy = async () => {
    if (deploying) return;
    setDeploying(true);
    try {
      const agent = await deployAgent(state);
      router.push(`/agents/${agent.id}`);
    } catch (err) {
      setDeploying(false);
      throw err;
    }
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
    </AppShell>
  );
}
