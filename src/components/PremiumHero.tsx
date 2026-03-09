"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const NODES = [
  { top: "12%", left: "14%", delay: "0s" },
  { top: "18%", left: "76%", delay: "1.1s" },
  { top: "34%", left: "26%", delay: "2.3s" },
  { top: "42%", left: "86%", delay: "0.8s" },
  { top: "58%", left: "18%", delay: "1.7s" },
  { top: "63%", left: "68%", delay: "2.7s" },
  { top: "79%", left: "38%", delay: "1.2s" },
  { top: "84%", left: "83%", delay: "2.0s" },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const initialVars = {
  "--trail-x": "50%",
  "--trail-y": "38%",
  "--trail-angle": "0deg",
  "--trail-scale": "1",
  "--trail-opacity": "0.5",
} as CSSProperties;

export default function PremiumHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const targetRef = useRef({ x: 50, y: 38 });
  const currentRef = useRef({ x: 50, y: 38 });
  const previousRef = useRef({ x: 50, y: 38 });
  const activeRef = useRef(false);

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onChange = () => {
      setReducedMotion(media.matches);
    };

    onChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const applyVars = (
      x: number,
      y: number,
      angle: number,
      scale: number,
      opacity: number,
    ) => {
      element.style.setProperty("--trail-x", `${x}%`);
      element.style.setProperty("--trail-y", `${y}%`);
      element.style.setProperty("--trail-angle", `${angle}deg`);
      element.style.setProperty("--trail-scale", `${scale}`);
      element.style.setProperty("--trail-opacity", `${opacity}`);
    };

    applyVars(50, 38, 0, 1, 0.5);

    if (reducedMotion) {
      return;
    }

    const tick = () => {
      const current = currentRef.current;
      const target = targetRef.current;
      const previous = previousRef.current;

      current.x += (target.x - current.x) * 0.1;
      current.y += (target.y - current.y) * 0.1;

      const vx = current.x - previous.x;
      const vy = current.y - previous.y;

      previousRef.current = { ...current };

      const speed = clamp(Math.hypot(vx, vy) * 10, 0, 1.35);
      const angle = speed > 0.01 ? (Math.atan2(vy, vx) * 180) / Math.PI : 0;
      const scale = 1 + speed * 0.9;
      const opacity = activeRef.current ? 0.95 : 0.45;

      applyVars(current.x, current.y, angle, scale, opacity);

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [reducedMotion]);

  const updateTargetFromPointer = (
    event: React.PointerEvent<HTMLElement>,
  ) => {
    if (reducedMotion) return;
    if (event.pointerType === "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);

    targetRef.current = { x, y };
    activeRef.current = true;
  };

  const handlePointerLeave = () => {
    activeRef.current = false;
    targetRef.current = { x: 50, y: 38 };
  };

  return (
    <section
      ref={sectionRef}
      style={initialVars}
      onPointerMove={updateTargetFromPointer}
      onPointerEnter={updateTargetFromPointer}
      onPointerLeave={handlePointerLeave}
      className="relative isolate overflow-hidden border-b border-border/40 bg-background text-text"
    >
      {/* Background layers */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #030a04 0%, #000000 52%, #000000 100%)",
          }}
        />

        {/* Top radial wash */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(900px 500px at 50% -12%, rgba(22,163,74,0.06), transparent 58%)",
          }}
        />

        {/* Grid pattern */}
        <div className="cursor-trail-grid absolute inset-0 opacity-[0.08]" />

        {/* Cross pattern */}
        <div className="cursor-trail-pattern absolute inset-0 opacity-30" />

        {/* Floating nodes */}
        {!reducedMotion &&
          NODES.map((node, index) => (
            <span
              key={`${node.top}-${node.left}-${index}`}
              className="cursor-trail-node absolute h-1.5 w-1.5 rounded-full bg-accent/40"
              style={{
                top: node.top,
                left: node.left,
                animationDelay: node.delay,
                boxShadow: "0 0 18px rgba(22,163,74,0.25)",
              }}
            />
          ))}

        {/* Large cursor glow */}
        <div
          className="absolute h-[540px] w-[540px] rounded-full blur-3xl"
          style={{
            left: "var(--trail-x)",
            top: "var(--trail-y)",
            opacity: "calc(var(--trail-opacity) * 0.85)",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(22,163,74,0.16) 0%, rgba(22,163,74,0.08) 28%, rgba(22,163,74,0.04) 48%, rgba(0,0,0,0) 72%)",
          }}
        />

        {/* Comet tail */}
        <div
          className="absolute h-[34px] w-[190px] rounded-full blur-xl"
          style={{
            left: "var(--trail-x)",
            top: "var(--trail-y)",
            opacity: "calc(var(--trail-opacity) * 0.8)",
            transform:
              "translate(-86%, -50%) rotate(var(--trail-angle)) scaleX(var(--trail-scale))",
            transformOrigin: "100% 50%",
            background:
              "linear-gradient(90deg, rgba(22,163,74,0.00) 0%, rgba(22,163,74,0.05) 28%, rgba(34,197,94,0.14) 58%, rgba(255,255,255,0.18) 100%)",
          }}
        />

        {/* Medium cursor glow */}
        <div
          className="absolute h-24 w-24 rounded-full blur-2xl"
          style={{
            left: "var(--trail-x)",
            top: "var(--trail-y)",
            opacity: "var(--trail-opacity)",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(34,197,94,0.15) 40%, rgba(0,0,0,0) 74%)",
          }}
        />

        {/* Bright cursor dot */}
        <div
          className="absolute h-4 w-4 rounded-full"
          style={{
            left: "var(--trail-x)",
            top: "var(--trail-y)",
            opacity: "var(--trail-opacity)",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(34,197,94,0.6) 45%, rgba(22,163,74,0.2) 72%, rgba(0,0,0,0) 100%)",
            boxShadow:
              "0 0 16px rgba(255,255,255,0.15), 0 0 42px rgba(22,163,74,0.15)",
          }}
        />

        {/* Horizontal accent line */}
        <div
          className="absolute inset-x-[10%] top-[24%] h-px opacity-25"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(22,163,74,0.15) 25%, rgba(22,163,74,0.35) 50%, rgba(22,163,74,0.15) 75%, transparent 100%)",
          }}
        />

        {/* Corner glows */}
        <div
          className="absolute -right-28 -top-28 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "rgba(22,163,74,0.06)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "rgba(255,255,255,0.03)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto grid min-h-[78svh] max-w-6xl items-center gap-14 px-6 py-24 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-6 lg:py-28">
        <div className="max-w-3xl">
          <span className="mb-6 inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent backdrop-blur">
            Custom Systems &amp; Intelligent Automation
          </span>

          <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-text sm:text-4xl md:text-5xl lg:text-6xl">
            Custom operational systems for businesses that have outgrown spreadsheets, paper, and patchwork tools.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            We build custom web systems, approvals engines, dashboards, portals, and embedded AI tools for established businesses. Less admin, better visibility, faster decisions.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent2 hover:scale-[1.02]"
            >
              Book a Systems Audit
            </Link>
            <Link
              href="/solutions"
              className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-text transition-all duration-200 hover:border-accent/40 hover:bg-white/5"
            >
              Explore Solutions
            </Link>
          </div>

          {/* Proof strip */}
          <div className="mt-8 flex flex-wrap gap-3 text-xs text-muted2 sm:text-sm">
            <span className="rounded-full border border-border/60 bg-white/[0.03] px-3 py-2">
              Custom operational systems
            </span>
            <span className="rounded-full border border-border/60 bg-white/[0.03] px-3 py-2">
              Built for analogue-heavy businesses
            </span>
            <span className="rounded-full border border-border/60 bg-white/[0.03] px-3 py-2">
              Backed by 2KO process expertise
            </span>
          </div>
        </div>

        {/* Dashboard panel */}
        <div className="relative hidden lg:block">
          <div className="rounded-[30px] border border-border/40 bg-white/[0.03] p-5 backdrop-blur-xl">
            <div className="rounded-[24px] border border-border/60 bg-surface/90 p-5 shadow-2xl shadow-black/25">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted2">
                    Operational intelligence
                  </p>
                  <h3 className="mt-1 text-lg font-medium text-text">
                    Workflow visibility
                  </h3>
                </div>
                <div className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs text-accent">
                  Live
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-border/40 bg-white/[0.02] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-text/85">
                      Approvals queue
                    </span>
                    <span className="text-xs text-muted2">12 pending</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[68%] rounded-full bg-accent/70" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border/40 bg-white/[0.02] p-4">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted2">
                      Turnaround
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-text">
                      &minus;31%
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/40 bg-white/[0.02] p-4">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted2">
                      Visibility
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-accent">
                      Live
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/40 bg-white/[0.02] p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted2">
                    Embedded AI support
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Summaries, routing, search, and workflow support built into the operating layer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
