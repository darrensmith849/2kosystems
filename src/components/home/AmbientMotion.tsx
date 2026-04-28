"use client";

import React from "react";

/**
 * Ambient background motion for landing-page sections.
 *
 * Renders an absolute-positioned SVG with:
 *   - a slowly drifting accent-green orb cluster (gradient blur)
 *   - 5 floating particles that loop independently
 *   - 2 connecting lines that pulse gently
 *
 * Designed to read as quiet, premium movement — not a distracting
 * animation. All motion is paused under prefers-reduced-motion.
 *
 * Variants offer different motion personalities so multiple sections
 * can use the component without feeling identical:
 *   - "drift"  : slow horizontal drift (default)
 *   - "pulse"  : centered pulse ring
 *   - "mesh"   : two cross-fading gradient blobs
 */

type Variant = "drift" | "pulse" | "mesh";

interface AmbientMotionProps {
  variant?: Variant;
  className?: string;
}

export default function AmbientMotion({
  variant = "drift",
  className = "",
}: AmbientMotionProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {variant === "drift" && <DriftLayer />}
      {variant === "pulse" && <PulseLayer />}
      {variant === "mesh" && <MeshLayer />}
    </div>
  );
}

function DriftLayer() {
  return (
    <>
      {/* Drifting blurred accent orb */}
      <div className="ambient-drift-orb absolute h-[420px] w-[420px] rounded-full bg-accent/[0.06] blur-3xl" />

      {/* Floating particles */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="ambient-dot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ambient-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle className="ambient-particle ambient-particle-1" cx="120" cy="160" r="3" fill="url(#ambient-dot)" />
        <circle className="ambient-particle ambient-particle-2" cx="280" cy="420" r="2.5" fill="url(#ambient-dot)" />
        <circle className="ambient-particle ambient-particle-3" cx="640" cy="200" r="3.5" fill="url(#ambient-dot)" />
        <circle className="ambient-particle ambient-particle-4" cx="940" cy="360" r="2" fill="url(#ambient-dot)" />
        <circle className="ambient-particle ambient-particle-5" cx="1080" cy="120" r="3" fill="url(#ambient-dot)" />
        <circle className="ambient-particle ambient-particle-6" cx="430" cy="540" r="2.5" fill="url(#ambient-dot)" />

        {/* Connecting lines that pulse opacity */}
        <line
          className="ambient-line ambient-line-1"
          x1="120" y1="160" x2="640" y2="200"
          stroke="url(#ambient-line)" strokeWidth="1"
        />
        <line
          className="ambient-line ambient-line-2"
          x1="640" y1="200" x2="1080" y2="120"
          stroke="url(#ambient-line)" strokeWidth="1"
        />
        <line
          className="ambient-line ambient-line-3"
          x1="280" y1="420" x2="940" y2="360"
          stroke="url(#ambient-line)" strokeWidth="1"
        />
      </svg>
    </>
  );
}

function PulseLayer() {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="ambient-pulse-ring absolute inset-0 -m-32 rounded-full border border-accent/15" />
      <div className="ambient-pulse-ring ambient-pulse-ring-2 absolute inset-0 -m-32 rounded-full border border-accent/15" />
      <div className="ambient-pulse-ring ambient-pulse-ring-3 absolute inset-0 -m-32 rounded-full border border-accent/15" />
      <div className="h-32 w-32 rounded-full bg-accent/[0.04] blur-2xl" />
    </div>
  );
}

function MeshLayer() {
  return (
    <>
      <div
        className="ambient-mesh-blob-1 absolute h-[500px] w-[500px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(15,123,58,0.10) 0%, transparent 70%)" }}
      />
      <div
        className="ambient-mesh-blob-2 absolute h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(184,196,200,0.05) 0%, transparent 70%)" }}
      />
    </>
  );
}
