"use client";

import { useMemo } from "react";
import type { Commitment, CommitmentType } from "@/lib/types";

interface CommitmentGraphProps {
  commitments: Commitment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

interface PositionedNode {
  commitment: Commitment;
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
  indexInLayer: number;
}

const NODE_W = 188;
const NODE_H = 76;
const LAYER_GAP = 36;
const NODE_GAP = 16;
const PAD_X = 20;
const PAD_TOP = 20;
const PAD_BOTTOM = 20;

// Color hue per type group — keeps the monochrome aesthetic but gives each
// node a tiny visual anchor so the graph is scannable.
const typeAccent: Record<CommitmentType, string> = {
  offer: "var(--fg-3)",
  counter: "var(--fg-3)",
  scope_clause: "var(--accent)",
  license_terms: "var(--accent)",
  amendment: "var(--amber)",
  opt_out_delta: "var(--amber)",
  usage_restriction: "var(--amber)",
  dpa_reference: "var(--fg-2)",
  approval: "var(--accent)",
  signoff: "var(--accent)",
  participant_joined: "var(--fg-5)"
};

// Layer of a node = 1 + max(layer of each ref), 0 if no refs. Stable layout
// because we preserve fixture order within each layer.
function layout(commitments: Commitment[]) {
  const byId = new Map(commitments.map((c) => [c.id, c]));
  const layerCache = new Map<string, number>();
  function layerOf(id: string): number {
    const cached = layerCache.get(id);
    if (cached !== undefined) return cached;
    const c = byId.get(id);
    if (!c || !c.references || c.references.length === 0) {
      layerCache.set(id, 0);
      return 0;
    }
    const l = 1 + Math.max(...c.references.map(layerOf));
    layerCache.set(id, l);
    return l;
  }
  const byLayer = new Map<number, Commitment[]>();
  for (const c of commitments) {
    const l = layerOf(c.id);
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(c);
  }
  const layers = [...byLayer.keys()].sort((a, b) => a - b);
  const maxPerLayer = Math.max(...layers.map((l) => byLayer.get(l)!.length));
  const width = PAD_X * 2 + maxPerLayer * NODE_W + (maxPerLayer - 1) * NODE_GAP;
  const height = PAD_TOP + PAD_BOTTOM + layers.length * NODE_H + (layers.length - 1) * LAYER_GAP;
  const nodes: PositionedNode[] = [];
  for (const l of layers) {
    const layerNodes = byLayer.get(l)!;
    const rowWidth = layerNodes.length * NODE_W + (layerNodes.length - 1) * NODE_GAP;
    const startX = (width - rowWidth) / 2;
    const y = PAD_TOP + l * (NODE_H + LAYER_GAP);
    layerNodes.forEach((c, i) => {
      nodes.push({
        commitment: c,
        x: startX + i * (NODE_W + NODE_GAP),
        y,
        width: NODE_W,
        height: NODE_H,
        layer: l,
        indexInLayer: i
      });
    });
  }
  return { nodes, width, height, layerCount: layers.length };
}

export function CommitmentGraph({ commitments, selectedId, onSelect }: CommitmentGraphProps) {
  const { nodes, width, height } = useMemo(() => layout(commitments), [commitments]);
  const nodeById = new Map(nodes.map((n) => [n.commitment.id, n]));

  const selectedNeighbors = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const set = new Set<string>([selectedId]);
    const sel = commitments.find((c) => c.id === selectedId);
    if (sel?.references) sel.references.forEach((r) => set.add(r));
    for (const c of commitments) {
      if (c.references?.includes(selectedId)) set.add(c.id);
    }
    return set;
  }, [commitments, selectedId]);

  const edges: { id: string; from: PositionedNode; to: PositionedNode; selected: boolean }[] = [];
  for (const n of nodes) {
    for (const refId of n.commitment.references ?? []) {
      const from = nodeById.get(refId);
      if (!from) continue;
      const selected = selectedId === n.commitment.id || selectedId === refId;
      edges.push({ id: `${refId}->${n.commitment.id}`, from, to: n, selected });
    }
  }

  return (
    <div style={{ padding: 16, overflow: "auto" }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block", margin: "0 auto", maxWidth: "100%" }}
      >
        <defs>
          <marker
            id="arrow-default"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--surface-3)" />
          </marker>
          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((e, i) => {
          const x1 = e.from.x + e.from.width / 2;
          const y1 = e.from.y + e.from.height;
          const x2 = e.to.x + e.to.width / 2;
          const y2 = e.to.y - 2; // small gap before the arrowhead
          const midY = (y1 + y2) / 2;
          const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
          // Path length for the draw-on animation.
          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.hypot(dx, dy) + 40;
          const dimmed = selectedId !== null && !e.selected;
          return (
            <path
              key={e.id}
              d={path}
              fill="none"
              stroke={e.selected ? "var(--accent)" : "var(--surface-3)"}
              strokeWidth={e.selected ? 1.6 : 1}
              opacity={dimmed ? 0.25 : 0.85}
              markerEnd={`url(#${e.selected ? "arrow-active" : "arrow-default"})`}
              style={
                e.selected
                  ? {
                      strokeDasharray: "6 4",
                      animation: "summer-graph-edge-flow 1.1s linear infinite"
                    }
                  : {
                      strokeDasharray: `${len} ${len}`,
                      animation: `summer-graph-edge-in 420ms ease-out ${300 + i * 25}ms backwards`,
                      // CSS var consumed by the keyframe so each path computes its own offset.
                      ["--len" as unknown as string]: String(len)
                    }
              }
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((n, i) => {
          const c = n.commitment;
          const isSelected = c.id === selectedId;
          const isPending = c.status === "pending";
          const isFlagged = c.status === "flagged";
          const dimmed = selectedId !== null && !selectedNeighbors.has(c.id);
          const stroke = isSelected
            ? "var(--accent)"
            : isFlagged
            ? "var(--amber)"
            : "var(--surface-2)";
          const fill = isSelected ? "var(--accent-strong-bg)" : "var(--surface-1)";
          const accent = typeAccent[c.type];
          return (
            <g
              key={c.id}
              className={`graph-node${isSelected ? " graph-node-selected" : ""}`}
              style={{
                cursor: "pointer",
                opacity: dimmed ? 0.45 : 1,
                transition: "opacity 180ms ease",
                animation: `summer-graph-node-in 260ms ease-out ${n.layer * 60 + n.indexInLayer * 30}ms backwards`
              }}
              onClick={() => onSelect(c.id)}
            >
              <rect
                x={n.x}
                y={n.y}
                width={n.width}
                height={n.height}
                rx={10}
                ry={10}
                fill={fill}
                stroke={stroke}
                strokeWidth={isSelected ? 1.6 : 1}
                strokeDasharray={isPending && !isSelected ? "3 3" : undefined}
              />
              {/* Type-color accent dot */}
              <circle cx={n.x + 12} cy={n.y + 14} r={3.5} fill={accent} />
              {/* Type label */}
              <text
                x={n.x + 22}
                y={n.y + 17}
                fontFamily="var(--font-mono)"
                fontSize={10.5}
                fontWeight={isSelected ? 600 : 500}
                fill={isSelected ? "var(--accent)" : "var(--fg-2)"}
              >
                {c.type}
              </text>
              {/* Provenance badge top-right */}
              {c.derivedFromTurns.length > 0 && (
                <text
                  x={n.x + n.width - 10}
                  y={n.y + 17}
                  fontFamily="var(--font-mono)"
                  fontSize={9}
                  fill={isSelected ? "var(--accent)" : "var(--fg-5)"}
                  textAnchor="end"
                >
                  ←{c.derivedFromTurns.join(",")}
                </text>
              )}
              {/* Summary — HTML inside foreignObject so it wraps and clamps cleanly */}
              <foreignObject
                x={n.x + 10}
                y={n.y + 26}
                width={n.width - 20}
                height={n.height - 32}
              >
                <div
                  // @ts-expect-error xmlns is valid on div inside foreignObject
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    fontSize: 11,
                    color: isSelected ? "var(--fg-0)" : "var(--fg-2)",
                    lineHeight: 1.35,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                >
                  {c.summary}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
