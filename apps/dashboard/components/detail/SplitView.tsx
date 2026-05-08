"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Commitment, Turn } from "@/lib/types";
import { CommitmentsPane } from "./CommitmentsPane";
import { TranscriptPane } from "./TranscriptPane";

type ViewMode = "list" | "graph";

interface SplitViewProps {
  turns: Turn[];
  commitments: Commitment[];
  live?: boolean;
}

export function SplitView({ turns, commitments, live = false }: SplitViewProps) {
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [visibleCount, setVisibleCount] = useState<number>(live ? 0 : turns.length);
  const [typingSpeaker, setTypingSpeaker] = useState<string | null>(null);

  // Progressive reveal of turns when in live mode, with a "typing…" pause
  // before each turn lands. Cleared on unmount.
  useEffect(() => {
    if (!live) {
      setVisibleCount(turns.length);
      setTypingSpeaker(null);
      return;
    }
    setVisibleCount(0);
    setTypingSpeaker(null);
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
    schedule(() => revealNext(0), 500);
    return () => {
      cancelled = true;
      for (const t of timeouts) clearTimeout(t);
    };
  }, [live, turns]);

  const visibleTurns = useMemo(
    () => (live ? turns.slice(0, visibleCount) : turns),
    [live, turns, visibleCount]
  );

  // Commitments only "exist" once every turn they reference is on screen.
  // Drives both the list and graph panes so the right side fills in alongside
  // the transcript instead of being fully populated from the start.
  const visibleCommitments = useMemo(() => {
    if (!live) return commitments;
    return commitments.filter((c) => {
      if (c.derivedFromTurns.length === 0) return visibleCount > 0;
      return Math.max(...c.derivedFromTurns) <= visibleCount;
    });
  }, [live, commitments, visibleCount]);

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

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0,
        background: "var(--surface-0)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        overflow: "hidden",
        flex: 1,
        minHeight: 480
      }}
    >
      <TranscriptPane
        turns={visibleTurns}
        highlightedTurnIds={highlightedTurnIds}
        registerTurnRef={registerTurnRef}
        stickToBottom={live}
        animateIn={live}
        typingSpeaker={typingSpeaker}
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
  );
}
