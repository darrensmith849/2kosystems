"use client";

import { useEffect, useState } from "react";

type Readout = {
  label: string;
  value: string;
  unit?: string;
  /** Draws the value in the accent colour — use for the one figure that matters. */
  highlight?: boolean;
};

const readouts: Readout[] = [
  { label: "Requests today", value: "47" },
  { label: "In review", value: "12" },
  { label: "Approved", value: "+14", highlight: true },
  { label: "Exceptions", value: "0" },
];

/**
 * The floating operations readout that sits over the hero photograph.
 *
 * Deliberately not a screenshot: it is an abstracted instrument panel in
 * monospace, which reads as a live system without pretending to be any
 * particular client's data. Numbers are illustrative and static — the only
 * live element is the clock, which is why this is a client component.
 */
export default function OpsPanel() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-ZA", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="w-full max-w-[340px] rounded-2xl border border-white/20 p-5 text-white backdrop-blur-2xl"
      style={{
        background: "rgba(8, 16, 11, 0.78)",
        boxShadow: "0 30px 60px -24px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* Header — live marker and section counter */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="contact-live-dot h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          <span
            className="font-mono text-[10px] uppercase text-white/70"
            style={{ letterSpacing: "var(--tracking-eyebrow)" }}
          >
            Operations
          </span>
        </span>
        <span
          className="font-mono text-[10px] uppercase text-white/55"
          style={{ letterSpacing: "var(--tracking-eyebrow)" }}
        >
          Live / 01
        </span>
      </div>

      {/* The headline figure */}
      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">
        Avg. time to approval
      </p>
      <p className="mt-1 text-[40px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
        4h 12m
      </p>

      {/* Scale bar — the same device the reference site uses under its readouts */}
      <div className="mt-4">
        <div className="h-px w-full bg-white/15">
          <div className="h-px w-[38%] bg-[var(--accent)]" />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-white/50 tabular-nums">
          <span>00</span>
          <span>Target 6h</span>
          <span>12h</span>
        </div>
      </div>

      {/* Readout grid */}
      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-4">
        {readouts.map((readout) => (
          <div key={readout.label}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">
              {readout.label}
            </dt>
            <dd
              className={`mt-0.5 text-[18px] font-semibold tabular-nums ${
                readout.highlight ? "text-[var(--accent)]" : "text-white"
              }`}
            >
              {readout.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
        <span>Last sync</span>
        <span className="tabular-nums text-white/70">{time ?? "--:--"}</span>
      </div>
    </div>
  );
}
