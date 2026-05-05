"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Commitment, Turn } from "@/lib/types";
import { CommitmentsPane } from "./CommitmentsPane";
import { TranscriptPane } from "./TranscriptPane";

interface SplitViewProps {
  turns: Turn[];
  commitments: Commitment[];
}

export function SplitView({ turns, commitments }: SplitViewProps) {
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string | null>(null);

  const turnRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  // Hold the latest commitments in a ref so the scroll effect can read them
  // without re-firing when the array identity changes.
  const commitmentsRef = useRef(commitments);
  commitmentsRef.current = commitments;

  // Fire once per selection change. We do not depend on the resolved commitment
  // object — the ref read keeps the effect monomorphic on the id.
  useEffect(() => {
    if (selectedCommitmentId === null) return;
    const c = commitmentsRef.current.find((x) => x.id === selectedCommitmentId);
    if (!c || c.derivedFromTurns.length === 0) return;
    const firstId = c.derivedFromTurns[0];
    const el = turnRefs.current.get(firstId);
    // behavior: 'auto' is intentional — smooth scroll drops frames in recordings.
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
    // Clicking the currently-selected card deselects.
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
        height: "calc(100vh - 200px)",
        minHeight: 520
      }}
    >
      <TranscriptPane
        turns={turns}
        highlightedTurnIds={highlightedTurnIds}
        registerTurnRef={registerTurnRef}
      />
      <CommitmentsPane
        commitments={commitments}
        selectedId={selectedCommitmentId}
        onSelect={handleSelect}
      />
    </div>
  );
}
