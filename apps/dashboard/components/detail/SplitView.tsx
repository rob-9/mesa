"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Commitment, HitlGate, PolicyUpdate, PostSignoffTask, Turn } from "@/lib/types";
import { CommitmentsPane } from "./CommitmentsPane";
import { HITLBanner, type HitlState, type SlackApprover } from "./HITLBanner";
import {
  PostSignoffStrip,
  type PostSignoffEntry,
  type PostSignoffStatus
} from "./PostSignoffStrip";
import { TranscriptPane, type AuditEvent } from "./TranscriptPane";

type ViewMode = "list" | "graph";
type ApprovalSource = "slack" | "operator" | "replay";

interface SplitViewProps {
  turns: Turn[];
  commitments: Commitment[];
  hitlGate?: HitlGate;
  postSignoffTasks?: PostSignoffTask[];
  policyUpdate?: PolicyUpdate;
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
const SLACK_AUTO_APPROVE_MS = 5_000;
// How long the "Authorized" flash stays before fading out.
const ACCEPTED_FLASH_MS = 1_500;
// Stagger between agent2agent pings being kicked off in the post-signoff fan-out.
const FANOUT_STAGGER_MS = 350;
// Per-agent ping latency before resolution lands.
const AGENT_PING_MS = 700;
// Beat after the last turn lands before the strip itself appears.
const FANOUT_PRELUDE_MS = 400;

export function SplitView({
  turns,
  commitments,
  hitlGate,
  postSignoffTasks,
  policyUpdate,
  live = false
}: SplitViewProps) {
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [visibleCount, setVisibleCount] = useState<number>(live ? 0 : turns.length);
  const [typingSpeaker, setTypingSpeaker] = useState<string | null>(null);
  const [replanning, setReplanning] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const visibleCountRef = useRef(visibleCount);
  visibleCountRef.current = visibleCount;
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
  // Post-signoff fan-out state. In replay everything is already resolved (with
  // a static timestamp) so screenshots stay consistent; in live mode each task
  // moves queued → pinging → resolved on its own schedule.
  const initialSignoffStatuses = useMemo<Record<string, PostSignoffStatus>>(() => {
    if (!postSignoffTasks) return {};
    const map: Record<string, PostSignoffStatus> = {};
    for (const t of postSignoffTasks) {
      map[t.id] = !live ? "resolved" : "queued";
    }
    return map;
  }, [postSignoffTasks, live]);
  const [signoffStatuses, setSignoffStatuses] = useState(initialSignoffStatuses);
  const [signoffResolvedAt, setSignoffResolvedAt] = useState<Record<string, string>>(() => {
    if (!postSignoffTasks || live) return {};
    const map: Record<string, string> = {};
    for (const t of postSignoffTasks) map[t.id] = "14:39";
    return map;
  });
  const [humanSignedOff, setHumanSignedOff] = useState<boolean>(!live);

  // Progressive reveal of turns when in live mode, with a "typing…" pause
  // before each turn lands. Pauses at the HITL gate until the user authorizes.
  useEffect(() => {
    if (!live) {
      setVisibleCount(turns.length);
      setTypingSpeaker(null);
      return;
    }
    if (paused) {
      setTypingSpeaker(null);
      setReplanning(false);
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
      const typingDelay = 220 + Math.random() * 320;
      schedule(() => {
        if (cancelled) return;
        setTypingSpeaker(null);
        setVisibleCount(idx + 1);
        const justRevealedId = turns[idx]?.id;
        const onPolicyBoundary = policyUpdate?.afterTurn === justRevealedId;
        const afterDelay = onPolicyBoundary
          ? 1800 + Math.random() * 300
          : 110 + Math.random() * 180;
        if (onPolicyBoundary) {
          schedule(() => {
            if (cancelled) return;
            setReplanning(true);
          }, 300);
          schedule(() => {
            if (cancelled) return;
            setReplanning(false);
          }, afterDelay - 300);
        }
        schedule(() => revealNext(idx + 1), afterDelay);
      }, typingDelay);
    };

    if (hitlState === "inactive") {
      const startIdx = visibleCountRef.current;
      setTypingSpeaker(null);
      setReplanning(false);
      schedule(() => revealNext(startIdx), startIdx === 0 ? 500 : 200);
    } else if (hitlState === "accepted" && hitlGate) {
      const startIdx = Math.max(visibleCountRef.current, hitlGate.afterTurn);
      schedule(() => revealNext(startIdx), 600);
    }

    return () => {
      cancelled = true;
      for (const t of timeouts) clearTimeout(t);
    };
  }, [live, turns, hitlGate, hitlState, paused]);

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

  // Once every turn has been revealed in live mode, kick off the post-signoff
  // fan-out: each agent2agent task gets pinged on a stagger and auto-resolves;
  // the human signoff stays queued until the operator clicks the button.
  const allTurnsRevealed = !live || visibleCount >= turns.length;
  useEffect(() => {
    if (!live || !postSignoffTasks || !allTurnsRevealed) return;
    const agentTasks = postSignoffTasks.filter((t) => t.kind === "agent2agent");
    if (agentTasks.length === 0) return;
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    timeouts.push(
      setTimeout(() => {
        if (cancelled) return;
        agentTasks.forEach((task, i) => {
          timeouts.push(
            setTimeout(() => {
              if (cancelled) return;
              setSignoffStatuses((prev) =>
                prev[task.id] === "queued" ? { ...prev, [task.id]: "pinging" } : prev
              );
              timeouts.push(
                setTimeout(() => {
                  if (cancelled) return;
                  const ts = clockNow();
                  setSignoffStatuses((prev) =>
                    prev[task.id] !== "resolved"
                      ? { ...prev, [task.id]: "resolved" }
                      : prev
                  );
                  setSignoffResolvedAt((prev) =>
                    prev[task.id] ? prev : { ...prev, [task.id]: ts }
                  );
                }, AGENT_PING_MS)
              );
            }, i * FANOUT_STAGGER_MS)
          );
        });
      }, FANOUT_PRELUDE_MS)
    );
    return () => {
      cancelled = true;
      for (const t of timeouts) clearTimeout(t);
    };
  }, [live, postSignoffTasks, allTurnsRevealed]);

  const visibleTurns = useMemo(
    () => (live ? turns.slice(0, visibleCount) : turns),
    [live, turns, visibleCount]
  );

  const visibleCommitments = useMemo(() => {
    const signoffId = postSignoffTasks?.find((t) => t.kind === "human_signoff")
      ?.derivedFromCommitment;
    const flipSignoff = (c: Commitment): Commitment =>
      humanSignedOff && c.id === signoffId && c.status !== "accepted"
        ? { ...c, status: "accepted" }
        : c;
    if (!live) return commitments.map(flipSignoff);
    return commitments
      .filter((c) => {
        if (c.derivedFromTurns.length === 0) return visibleCount > 0;
        return Math.max(...c.derivedFromTurns) <= visibleCount;
      })
      .map(flipSignoff);
  }, [live, commitments, visibleCount, humanSignedOff, postSignoffTasks]);

  // Audit lines render alongside revealed turns: the gate audit only appears
  // once the gate-turn itself is visible.
  const visibleAuditEvent = useMemo<AuditEvent | null>(() => {
    if (!auditEvent) return null;
    if (!live) return auditEvent;
    return visibleCount > auditEvent.afterTurn ? auditEvent : null;
  }, [auditEvent, live, visibleCount]);

  const visiblePolicyUpdate = useMemo<PolicyUpdate | null>(() => {
    if (!policyUpdate) return null;
    if (!live) return policyUpdate;
    return visibleCount > policyUpdate.afterTurn ? policyUpdate : null;
  }, [policyUpdate, live, visibleCount]);

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

  // Keyboard nav: Esc clears the current selection, j/k or ArrowDown/ArrowUp
  // step through commitments. We ignore key events that originate inside an
  // input/textarea/contenteditable so we don't hijack typing in any future
  // command bar.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape" && selectedCommitmentId !== null) {
        setSelectedCommitmentId(null);
        e.preventDefault();
        return;
      }
      const list = visibleCommitments;
      if (list.length === 0) return;
      const isNext = e.key === "j" || e.key === "ArrowDown";
      const isPrev = e.key === "k" || e.key === "ArrowUp";
      if (!isNext && !isPrev) return;
      const idx = selectedCommitmentId
        ? list.findIndex((c) => c.id === selectedCommitmentId)
        : -1;
      const nextIdx = isNext
        ? (idx < 0 ? 0 : Math.min(list.length - 1, idx + 1))
        : (idx <= 0 ? 0 : idx - 1);
      const next = list[nextIdx];
      if (next) {
        setSelectedCommitmentId(next.id);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedCommitmentId, visibleCommitments]);

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

  const handleSignoff = useCallback(() => {
    const signoffTask = postSignoffTasks?.find((t) => t.kind === "human_signoff");
    if (!signoffTask) return;
    const ts = clockNow();
    setSignoffStatuses((prev) => ({ ...prev, [signoffTask.id]: "resolved" }));
    setSignoffResolvedAt((prev) => ({ ...prev, [signoffTask.id]: ts }));
    setHumanSignedOff(true);
  }, [postSignoffTasks]);

  const signoffEntries = useMemo<PostSignoffEntry[]>(() => {
    if (!postSignoffTasks) return [];
    return postSignoffTasks.map((task) => ({
      task,
      status: signoffStatuses[task.id] ?? "queued",
      resolvedAt: signoffResolvedAt[task.id]
    }));
  }, [postSignoffTasks, signoffStatuses, signoffResolvedAt]);

  const showBanner =
    hitlGate && hitlState !== "inactive" && !(hitlState === "accepted" && bannerHidden);
  const showSignoffStrip =
    !!postSignoffTasks && postSignoffTasks.length > 0 && allTurnsRevealed;

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
          policyUpdate={visiblePolicyUpdate}
          replanIndicator={
            live && replanning
              ? {
                  agent: "lab-buyer-agent",
                  label: "re-planning under updated PII rule…"
                }
              : null
          }
          paused={live ? paused : null}
          onTogglePause={live ? () => setPaused((p) => !p) : undefined}
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
      {showSignoffStrip && (
        <PostSignoffStrip entries={signoffEntries} onSignoff={handleSignoff} />
      )}
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
