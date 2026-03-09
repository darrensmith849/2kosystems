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

export default function PremiumCursorTrailHero() {
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
      className="relative isolate overflow-hidden border-b border-white/10 bg-[#050913] text-white"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #07101d 0%, #050913 52%, #03060d 100%)",
          }}
        />

        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(900px 500px at 50% -12%, rgba(255,255,255,0.08), transparent 58%)",
          }}
        />

        <div className="cursor-trail-grid absolute inset-0 opacity-[0.12]" />
        <div className="cursor-trail-pattern absolute inset-0 opacity-40" />

        {!reducedMotion &&
          NODES.map((node, index) => (
            <span
              key={`${node.top}-${node.left}-${index}`}
              className="cursor-trail-node absolute h-2 w-2 rounded-full bg-white/55"
              style={{
                top: node.top,
                left: node.left,
                animationDelay: node.delay,
                boxShadow: "0 0 18px rgba(148,163,184,0.35)",
              }}
            />
          ))}

        <div
          className="absolute h-[540px] w-[540px] rounded-full blur-3xl"
          style={{
            left: "var(--trail-x)",
            top: "var(--trail-y)",
            opacity: "calc(var(--trail-opacity) * 0.95)",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(89,132,255,0.22) 0%, rgba(68,108,221,0.14) 28%, rgba(22,39,77,0.10) 48%, rgba(0,0,0,0) 72%)",
          }}
        />

        <div
          className="absolute h-[34px] w-[190px] rounded-full blur-xl"
          style={{
            left: "var(--trail-x)",
            top: "var(--trail-y)",
            opacity: "calc(var(--trail-opacity) * 0.9)",
            transform:
              "translate(-86%, -50%) rotate(var(--trail-angle)) scaleX(var(--trail-scale))",
            transformOrigin: "100% 50%",
            background:
              "linear-gradient(90deg, rgba(103,132,255,0.00) 0%, rgba(103,132,255,0.07) 28%, rgba(123,150,255,0.18) 58%, rgba(255,255,255,0.28) 100%)",
          }}
        />

        <div
          className="absolute h-24 w-24 rounded-full blur-2xl"
          style={{
            left: "var(--trail-x)",
            top: "var(--trail-y)",
            opacity: "var(--trail-opacity)",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.34) 0%, rgba(147,178,255,0.22) 40%, rgba(0,0,0,0) 74%)",
          }}
        />

        <div
          className="absolute h-4 w-4 rounded-full"
          style={{
            left: "var(--trail-x)",
            top: "var(--trail-y)",
            opacity: "var(--trail-opacity)",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(196,215,255,0.88) 45%, rgba(109,146,255,0.35) 72%, rgba(0,0,0,0) 100%)",
            boxShadow:
              "0 0 16px rgba(255,255,255,0.22), 0 0 42px rgba(93,125,255,0.2)",
          }}
        />

        <div
          className="absolute inset-x-[10%] top-[24%] h-px opacity-35"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.42) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)",
          }}
        />

        <div
          className="absolute -right-28 -top-28 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "rgba(99,129,255,0.10)" }}
        />

        <div
          className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[78svh] max-w-7xl items-center gap-14 px-6 py-24 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-28">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/70 backdrop-blur">
            Custom Systems &amp; Intelligent Automation
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Custom operational systems for businesses that have outgrown spreadsheets, paper, and patchwork tools.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            We build custom web systems, approvals engines, dashboards, portals,
            and embedded AI tools for established businesses. Less admin, better
            visibility, faster decisions.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition duration-200 hover:scale-[1.02]"
            >
              Book a Systems Audit
            </Link>

            <Link
              href="/solutions"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition duration-200 hover:bg-white/10"
            >
              Explore Solutions
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/65 sm:text-sm">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
              Custom operational systems
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
              Built for analogue-heavy businesses
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
              Backed by 2KO process expertise
            </span>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="rounded-[24px] border border-white/10 bg-[#081120]/85 p-5 shadow-2xl shadow-black/25">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                    Operational intelligence
                  </p>
                  <h3 className="mt-1 text-lg font-medium text-white">
                    Workflow visibility
                  </h3>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  Live
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-white/85">
                      Approvals queue
                    </span>
                    <span className="text-xs text-white/45">12 pending</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[68%] rounded-full bg-white/70" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                      Turnaround
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      -31%
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                      Visibility
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      Live
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                    Embedded AI support
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Summaries, routing, search, and workflow support built into
                    the operating layer.
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
