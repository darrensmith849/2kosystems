"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The method reel.
 *
 * /method describes a five-phase progression and then rendered it as five
 * near-identical text blocks with a price card beside each. The page argues for
 * a sequence while showing a list, which is why it read flattest on the site.
 *
 * This is the BuildReel idea pointed at DMAIC instead of at websites: one panel
 * that actually advances through Define, Measure, Analyse, Improve and Control,
 * with the instruments changing shape at each step because the work does. It is
 * abstracted — no client's data, no real numbers beyond the ones already
 * published on this site.
 *
 * Same discipline as the other reel: stops when scrolled out of view, and
 * never starts at all under prefers-reduced-motion, because this sits on pages
 * we pay for clicks on.
 */

type Phase = {
  letter: string;
  name: string;
  /** What this phase is doing, in the operator's words. */
  doing: string;
  accent: string;
  kind: "define" | "measure" | "analyse" | "improve" | "control";
};

const PHASES: Phase[] = [
  {
    letter: "D",
    name: "Define",
    doing: "Bounding the process",
    accent: "#8fa6d8",
    kind: "define",
  },
  {
    letter: "M",
    name: "Measure",
    doing: "Establishing the baseline",
    accent: "#d9a95a",
    kind: "measure",
  },
  {
    letter: "A",
    name: "Analyse",
    doing: "Finding the vital few",
    accent: "#c96f5a",
    kind: "analyse",
  },
  {
    letter: "I",
    name: "Improve",
    doing: "Proving the change",
    accent: "#4fae6a",
    kind: "improve",
  },
  {
    letter: "C",
    name: "Control",
    doing: "Holding the gain",
    accent: "#6a8cff",
    kind: "control",
  },
];

/** Long enough to read the panel, short enough that the cycle is not a wait. */
const DWELL = 3400;
/** The beat where the old panel is gone and the new one has not landed. Kept
 *  short: at 420ms the panel was empty for 11% of every cycle, and a capture
 *  at any moment had a real chance of catching nothing. */
const SWAP = 170;

export default function PhaseReel() {
  const [index, setIndex] = useState(0);
  const [live, setLive] = useState(true);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    if (live) {
      const id = setTimeout(() => setLive(false), DWELL);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % PHASES.length);
      setLive(true);
    }, SWAP);
    return () => clearTimeout(id);
  }, [active, live, index]);

  const phase = PHASES[index];

  return (
    <div className="k-phase" ref={ref} style={{ ["--ph" as string]: phase.accent }}>
      <div className="k-reel-frame">
        {/* ------------------------------------------------------- the rail */}
        <div className="k-phase-bar">
          <ol className="k-phase-steps">
            {PHASES.map((p, i) => (
              <li
                key={p.letter}
                data-state={i === index ? "on" : i < index ? "done" : "off"}
              >
                <span className="k-phase-dot">{p.letter}</span>
                <span className="k-phase-name">{p.name}</span>
              </li>
            ))}
          </ol>
          <span className="k-phase-doing">{phase.doing}</span>
        </div>

        {/* ---------------------------------------------------- the panel */}
        <div className="k-phase-view" aria-hidden>
          <div key={index} className={`k-phase-card${live ? " is-in" : ""}`}>
            <Stage phase={phase} />
          </div>
        </div>
      </div>

      <p className="k-reel-caption">
        <span className="k-reel-caption-label">Define · Measure · Analyse · Improve · Control</span>
        <span className="k-reel-caption-note">
          Illustrative. The shape of the work at each phase, not any client&rsquo;s numbers.
        </span>
      </p>
    </div>
  );
}

/** Each phase gets its own instrument, because each phase does its own job. */
function Stage({ phase }: { phase: Phase }) {
  if (phase.kind === "define") {
    return (
      <div className="k-ph-define">
        <p className="k-ph-h">Goods receiving · gate to GRN</p>
        <ul className="k-ph-scope">
          <li data-in="1">Delivery arrives at gate</li>
          <li data-in="1">Checked against the order</li>
          <li data-in="1">GRN raised and signed</li>
          <li data-in="0">Supplier onboarding</li>
          <li data-in="0">Payment run</li>
        </ul>
        <p className="k-ph-foot">
          <b>3 steps in scope</b> · 2 out, in writing, before anyone builds
        </p>
      </div>
    );
  }

  if (phase.kind === "measure") {
    return (
      <div className="k-ph-measure">
        <p className="k-ph-h">Baseline · 6 weeks observed</p>
        <div className="k-ph-nums">
          <span>
            <b>14</b>
            <i>hrs / week re-keying</i>
          </span>
          <span>
            <b>31%</b>
            <i>GRNs raised late</i>
          </span>
          <span>
            <b>R412k</b>
            <i>annualised cost</i>
          </span>
        </div>
        <div className="k-ph-spark">
          {[38, 52, 41, 63, 49, 71, 58, 66, 74, 61, 79, 68].map((v, i) => (
            <i key={i} style={{ height: `${v}%`, animationDelay: `${i * 55}ms` }} />
          ))}
        </div>
        <p className="k-ph-foot">Observed, not reported. Every figure shows its working.</p>
      </div>
    );
  }

  if (phase.kind === "analyse") {
    const bars = [
      { label: "Manual re-keying", v: 100, vital: true },
      { label: "Waiting on sign-off", v: 62, vital: true },
      { label: "Wrong line quantities", v: 24 },
      { label: "Lost paperwork", v: 14 },
      { label: "Everything else", v: 7 },
    ];
    return (
      <div className="k-ph-analyse">
        <p className="k-ph-h">Pareto · where the loss actually sits</p>
        <ul className="k-ph-bars">
          {bars.map((b, i) => (
            <li key={b.label} data-vital={b.vital ? "1" : "0"}>
              <span className="k-ph-bar-label">{b.label}</span>
              <span className="k-ph-bar-track">
                <i style={{ width: `${b.v}%`, animationDelay: `${i * 90}ms` }} />
              </span>
            </li>
          ))}
        </ul>
        <p className="k-ph-foot">
          <b>Two causes carry 78%</b>. The other three are not worth building for.
        </p>
      </div>
    );
  }

  if (phase.kind === "improve") {
    return (
      <div className="k-ph-improve">
        <p className="k-ph-h">Pilot · one workflow, week two</p>
        <div className="k-ph-swing">
          <span className="k-ph-was">
            <i>Before</i>
            <b>14 hrs</b>
          </span>
          <span className="k-ph-arrow" />
          <span className="k-ph-now">
            <i>After</i>
            <b>2 hrs</b>
          </span>
        </div>
        <ul className="k-ph-checks">
          <li>Captured once, at the gate</li>
          <li>Sign-off routed by threshold</li>
          <li>Demoed weekly against real data</li>
        </ul>
        <p className="k-ph-foot">Success criteria agreed in writing before work started.</p>
      </div>
    );
  }

  return (
    <div className="k-ph-control">
      <p className="k-ph-h">Control chart · the gain, holding</p>
      <div className="k-ph-chart">
        <span className="k-ph-limit k-ph-limit--u">UCL</span>
        <span className="k-ph-limit k-ph-limit--l">LCL</span>
        <span className="k-ph-mid" />
        <svg viewBox="0 0 300 90" preserveAspectRatio="none" className="k-ph-line">
          <polyline
            points="0,58 25,44 50,52 75,38 100,47 125,41 150,50 175,36 200,45 225,40 250,48 275,42 300,46"
            fill="none"
            stroke="var(--ph)"
            strokeWidth="1.6"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <p className="k-ph-foot">
        <b>In control.</b> The control plan is the system — not a form somebody has to
        remember to fill in.
      </p>
    </div>
  );
}
