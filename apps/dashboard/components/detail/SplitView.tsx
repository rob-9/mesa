"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Commitment, HitlGate, Turn } from "@/lib/types";
import { CommitmentsPane } from "./CommitmentsPane";
import { HITLBanner, type HitlState, type SlackApprover } from "./HITLBanner";
import { TranscriptPane, type AuditEvent } from "./TranscriptPane";

type ViewMode = "list" | "graph";
type ApprovalSource = "slack" | "operator" | "replay";

interface SplitViewProps {
  turns: Turn[];
  commitments: Commitment[];
  hitlGate?: HitlGate;
  live?: boolean;
}

const SLACK_APPROVER: SlackApprover = {
  name: "K. Mehta",
  role: "legal-ops",
  channel: "#agent-approvals",
  pingedAt: "14:24"
};
// How long to wait for a "Slack response" before the simulated approver
// auto-approves. The dashboard operator can short-circuit with Force accept.
const SLACK_AUTO_APPROVE_MS = 10_000;
// How long the "Authorized" flash stays before fading out.
const ACCEPTED_FLASH_MS = 2_600;

export function SplitView({ turns, commitments, hitlGate, live = false }: SplitViewProps) {
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [visibleCount, setVisibleCount] = useState<number>(live ? 0 : turns.length);
  const [typingSpeaker, setTypingSpeaker] = useState<string | null>(null);
  const [hitlState, setHitlState] = useState<HitlState>(
    hitlGate && !live ? "accepted" : "inactive"
  );
  // Replay mode hides the banner immediately and shows a static audit line so
  // the screenshot is consistent. Live mode starts banner-visible (it'll only
  // render once the gate fires) and audit-empty.
  const [bannerHidden, setBannerHidden] = useState<boolean>(!!hitlGate && !live);
  const [auditEvent, setAuditEvent] = useState<AuditEvent | null>(
    !live && hitlGate
      ? {
          afterTurn: hitlGate.afterTurn,
          kind: "hitl_approved",
          source: "replay",
          label: "approved via Slack-MCP — counter-terms authorized",
          actor: `${SLACK_APPROVER.name} · ${SLACK_APPROVER.role}`,
          timestamp: "14:24"
        }
      : null
  );

  // Progressive reveal of turns when in live mode, with a "typing…" pause
  // before each turn lands. Pauses at the HITL gate until the user authorizes.
  useEffect(() => {
    if (!live) {
      setVisibleCount(turns.length);
      setTypingSpeaker(null);
      return;
    }
    if (hitlState === "pending" || hitlState === "declined") {
      setTypingSpeaker(null);
      return;
    }

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      timeouts.push(setTimeout(fn, ms));
    };
    const revealNext = (idx: number) => {
      if (cancelled || idx >= turns.length) {
        setTypingSpeaker(null);
        return;
      }
      if (hitlGate && idx === hitlGate.afterTurn && hitlState === "inactive") {
        setTypingSpeaker(null);
        setHitlState("pending");
        return;
      }
      setTypingSpeaker(turns[idx].speaker);
      const typingDelay = 500 + Math.random() * 700;
      schedule(() => {
        if (cancelled) return;
        setTypingSpeaker(null);
        setVisibleCount(idx + 1);
        const afterDelay = 250 + Math.random() * 350;
        schedule(() => revealNext(idx + 1), afterDelay);
      }, typingDelay);
    };

    if (hitlState === "inactive") {
      setVisibleCount(0);
      setTypingSpeaker(null);
      schedule(() => revealNext(0), 500);
    } else if (hitlState === "accepted" && hitlGate) {
      schedule(() => revealNext(hitlGate.afterTurn), 600);
    }

    return () => {
      cancelled = true;
      for (const t of timeouts) clearTimeout(t);
    };
  }, [live, turns, hitlGate, hitlState]);

  // While pending, simulate the slack approver responding after a delay.
  useEffect(() => {
    if (hitlState !== "pending" || !hitlGate) return;
    const timer = setTimeout(() => {
      setHitlState((s) => (s === "pending" ? "accepted" : s));
      setAuditEvent({
        afterTurn: hitlGate.afterTurn,
        kind: "hitl_approved",
        source: "slack",
        label: "approved via Slack-MCP — counter-terms authorized",
        actor: `${SLACK_APPROVER.name} · ${SLACK_APPROVER.role}`,
        timestamp: clockNow()
      });
    }, SLACK_AUTO_APPROVE_MS);
    return () => clearTimeout(timer);
  }, [hitlState, hitlGate]);

  // Auto-dismiss the "Authorized" flash so the audit line in the transcript
  // becomes the canonical record.
  useEffect(() => {
    if (hitlState !== "accepted" || bannerHidden) return;
    const timer = setTimeout(() => setBannerHidden(true), ACCEPTED_FLASH_MS);
    return () => clearTimeout(timer);
  }, [hitlState, bannerHidden]);

  const visibleTurns = useMemo(
    () => (live ? turns.slice(0, visibleCount) : turns),
    [live, turns, visibleCount]
  );

  const visibleCommitments = useMemo(() => {
    if (!live) return commitments;
    return commitments.filter((c) => {
      if (c.derivedFromTurns.length === 0) return visibleCount > 0;
      return Math.max(...c.derivedFromTurns) <= visibleCount;
    });
  }, [live, commitments, visibleCount]);

  // Audit lines render alongside revealed turns: the gate audit only appears
  // once the gate-turn itself is visible.
  const visibleAuditEvent = useMemo<AuditEvent | null>(() => {
    if (!auditEvent) return null;
    if (!live) return auditEvent;
    return visibleCount > auditEvent.afterTurn ? auditEvent : null;
  }, [auditEvent, live, visibleCount]);

  const turnRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const commitmentsRef = useRef(commitments);
  commitmentsRef.current = commitments;

  useEffect(() => {
    if (selectedCommitmentId === null) return;
    const c = commitmentsRef.current.find((x) => x.id === selectedCommitmentId);
    if (!c || c.derivedFromTurns.length === 0) return;
    const firstId = c.derivedFromTurns[0];
    const el = turnRefs.current.get(firstId);
    el?.scrollIntoView({ behavior: "auto", block: "center" });
  }, [selectedCommitmentId]);

  useEffect(() => {
    if (hitlState !== "pending" || !hitlGate) return;
    const el = turnRefs.current.get(hitlGate.afterTurn);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [hitlState, hitlGate]);

  const highlightedTurnIds = useMemo(() => {
    const c = commitments.find((x) => x.id === selectedCommitmentId);
    return new Set(c?.derivedFromTurns ?? []);
  }, [commitments, selectedCommitmentId]);

  const registerTurnRef = useCallback((id: number, el: HTMLDivElement | null) => {
    if (el) turnRefs.current.set(id, el);
    else turnRefs.current.delete(id);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedCommitmentId((current) => (current === id ? null : id));
  }, []);

  const recordOperatorAudit = useCallback(() => {
    if (!hitlGate) return;
    setAuditEvent({
      afterTurn: hitlGate.afterTurn,
      kind: "hitl_approved",
      source: "operator",
      label: "force-approved by dashboard operator — counter-terms authorized",
      actor: "you · dashboard operator",
      timestamp: clockNow()
    });
  }, [hitlGate]);

  const handleForceAccept = useCallback(() => {
    setHitlState("accepted");
    recordOperatorAudit();
  }, [recordOperatorAudit]);

  const handleDecline = useCallback(() => setHitlState("declined"), []);

  const handleOverride = useCallback(() => {
    setHitlState("accepted");
    recordOperatorAudit();
  }, [recordOperatorAudit]);

  const showBanner =
    hitlGate && hitlState !== "inactive" && !(hitlState === "accepted" && bannerHidden);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-0)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        overflow: "hidden"
      }}
    >
      {showBanner && hitlGate && (
        <HITLBanner
          gate={hitlGate}
          state={hitlState}
          approver={SLACK_APPROVER}
          onForceAccept={handleForceAccept}
          onDecline={handleDecline}
          onOverride={handleOverride}
        />
      )}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "minmax(0, 1fr)",
          gap: 0
        }}
      >
        <TranscriptPane
          turns={visibleTurns}
          highlightedTurnIds={highlightedTurnIds}
          registerTurnRef={registerTurnRef}
          stickToBottom={live && hitlState !== "pending"}
          animateIn={live}
          typingSpeaker={typingSpeaker}
          auditEvent={visibleAuditEvent}
        />
        <CommitmentsPane
          commitments={visibleCommitments}
          selectedId={selectedCommitmentId}
          onSelect={handleSelect}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          animateIn={live}
        />
      </div>
    </div>
  );
}

function clockNow(): string {
  // hh:mm in local 24h. Used purely for the audit-line timestamp.
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

// Re-exported so other modules don't need to know the precise shape.
export type { ApprovalSource };
