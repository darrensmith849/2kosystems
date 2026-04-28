"use client";

import React from "react";

/**
 * OperationsLattice — bespoke background motion for the
 * "Built for real operations" section.
 *
 * Renders a wide SVG lattice that reads as an orchestration map:
 *   - 12 service nodes laid out on a grid
 *   - thin lattice edges between them (the "wiring")
 *   - data trails that pulse along selected edges in sequence
 *   - a few state nodes that breathe (active service indicators)
 *   - a slow scanline wash across the whole lattice
 *
 * Pure SVG + CSS animations. No JS animation loop, no Framer Motion.
 * All motion respects prefers-reduced-motion.
 */

const NODES = [
  // 4 columns × 3 rows lattice, gently jittered for organic feel
  { x: 100,  y: 80,  active: true  },
  { x: 380,  y: 80,  active: false },
  { x: 660,  y: 80,  active: true  },
  { x: 940,  y: 80,  active: false },

  { x: 100,  y: 230, active: false },
  { x: 380,  y: 230, active: true  },
  { x: 660,  y: 230, active: false },
  { x: 940,  y: 230, active: false },

  { x: 100,  y: 380, active: false },
  { x: 380,  y: 380, active: false },
  { x: 660,  y: 380, active: true  },
  { x: 940,  y: 380, active: false },
];

// Pre-computed lattice edges (horizontal + vertical only, no diagonal mess)
const EDGES: { from: number; to: number }[] = [
  // row 0
  { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
  // row 1
  { from: 4, to: 5 }, { from: 5, to: 6 }, { from: 6, to: 7 },
  // row 2
  { from: 8, to: 9 }, { from: 9, to: 10 }, { from: 10, to: 11 },
  // verticals (column 0..3)
  { from: 0, to: 4 }, { from: 4, to: 8 },
  { from: 1, to: 5 }, { from: 5, to: 9 },
  { from: 2, to: 6 }, { from: 6, to: 10 },
  { from: 3, to: 7 }, { from: 7, to: 11 },
];

// Subset of edges that get an animated travelling pulse
const PULSED_EDGE_INDEXES = [0, 5, 8, 11, 14];

export default function OperationsLattice() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Soft accent wash behind the lattice */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 460px at 50% 50%, rgba(15,123,58,0.10) 0%, transparent 65%)",
        }}
      />

      {/* Top-down fade so the lattice melts into the section background at the top/bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--background) 0%, transparent 18%, transparent 82%, var(--background) 100%)",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1040 460"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="lattice-node" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="1" />
            <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="lattice-edge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(184,196,200,0)" />
            <stop offset="50%" stopColor="rgba(184,196,200,0.22)" />
            <stop offset="100%" stopColor="rgba(184,196,200,0)" />
          </linearGradient>

          <linearGradient id="lattice-pulse" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(15,123,58,0)" />
            <stop offset="50%" stopColor="rgba(15,123,58,0.95)" />
            <stop offset="100%" stopColor="rgba(15,123,58,0)" />
          </linearGradient>
        </defs>

        {/* Static lattice edges (the "wiring") */}
        <g stroke="rgba(184,196,200,0.18)" strokeWidth="1">
          {EDGES.map((e, i) => {
            const a = NODES[e.from];
            const b = NODES[e.to];
            return (
              <line
                key={`edge-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
              />
            );
          })}
        </g>

        {/* Pulsed edges — accent-coloured travelling dash */}
        <g strokeWidth="1.4" fill="none">
          {PULSED_EDGE_INDEXES.map((idx, i) => {
            const e = EDGES[idx];
            const a = NODES[e.from];
            const b = NODES[e.to];
            return (
              <line
                key={`pulse-${idx}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(15,123,58,0.65)"
                className={`lattice-pulse-edge lattice-pulse-edge-${i + 1}`}
              />
            );
          })}
        </g>

        {/* Service nodes */}
        <g>
          {NODES.map((n, i) => (
            <g key={`node-${i}`} transform={`translate(${n.x} ${n.y})`}>
              {/* Outer halo — only for active nodes */}
              {n.active && (
                <circle
                  r="18"
                  fill="url(#lattice-node)"
                  className="lattice-node-halo"
                  style={{ animationDelay: `${(i % 4) * 0.4}s` }}
                />
              )}
              {/* Glass node body */}
              <circle
                r="6"
                fill="rgba(20, 24, 28, 0.95)"
                stroke={n.active ? "rgba(15,123,58,0.9)" : "rgba(184,196,200,0.35)"}
                strokeWidth="1"
              />
              {/* Inner dot for active state */}
              {n.active && (
                <circle r="2" fill="var(--accent)" className="lattice-node-core" />
              )}
            </g>
          ))}
        </g>

        {/* Slow scanline wash */}
        <rect
          x="-100"
          y="0"
          width="220"
          height="460"
          fill="url(#lattice-edge)"
          className="lattice-scanline"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}
