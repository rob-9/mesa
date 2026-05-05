"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

  const selected = useMemo(
    () => commitments.find((c) => c.id === selectedCommitmentId) ?? null,
    [commitments, selectedCommitmentId]
  );

  // Scroll the first highlighted turn into view, exactly once per selection change.
  // behavior: 'auto' is intentional — smooth scroll drops frames in screen recordings.
  useEffect(() => {
    if (!selected || selected.derivedFromTurns.length === 0) return;
    const firstId = selected.derivedFromTurns[0];
    const el = turnRefs.current.get(firstId);
    if (el) {
      el.scrollIntoView({ behavior: "auto", block: "center" });
    }
  }, [selectedCommitmentId, selected]);

  const highlightedTurnIds = useMemo(
    () => new Set(selected?.derivedFromTurns ?? []),
    [selected]
  );

  function handleSelect(id: string) {
    // Clicking the currently-selected card deselects.
    setSelectedCommitmentId((current) => (current === id ? null : id));
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0,
        background: "#0f0d0c",
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
        registerTurnRef={(id, el) => {
          if (el) turnRefs.current.set(id, el);
          else turnRefs.current.delete(id);
        }}
      />
      <CommitmentsPane
        commitments={commitments}
        selectedId={selectedCommitmentId}
        onSelect={handleSelect}
      />
    </div>
  );
}
