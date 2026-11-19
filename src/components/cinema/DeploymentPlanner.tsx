"use client";

import { useState } from "react";
import TrackedLink from "@/components/cinema/TrackedLink";

// The visitor types their headcount and sees their own deployment: the belts,
// the projects, the waves and the first year. Every number on it belongs to
// their organisation, none to ours. The ratios are typical, not a quote.
const RATIOS = { yellow: 0.15, green: 0.04, black: 0.004 } as const;
const WAVE_SIZE = 20;
const PRESETS = [500, 2000, 10000];
const DEFAULT_HEADCOUNT = 8000;
const MAX_HEADCOUNT = 1_000_000;

const year = [
  { when: "Month 1", title: "Everyone starts" },
  { when: "Month 3", title: "Your first project leads" },
  { when: "Month 6", title: "First projects signed off" },
  { when: "Month 12", title: "Results at your exco" },
];

const fmt = (n: number) => n.toLocaleString("en-US");

export default function DeploymentPlanner() {
  const [input, setInput] = useState(String(DEFAULT_HEADCOUNT));
  const parsed = Math.round(Number(input));
  const headcount = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, MAX_HEADCOUNT) : 0;
  const share = (ratio: number) => (headcount ? Math.max(1, Math.round(headcount * ratio)) : 0);
  const green = share(RATIOS.green);

  const belts = [
    { name: "White Belt", role: "everyone", count: headcount, colour: "#e8e3da" },
    { name: "Yellow Belt", role: "team members", count: share(RATIOS.yellow), colour: "#e2c25a" },
    { name: "Green Belt", role: "project leads", count: green, colour: "var(--signal)" },
    { name: "Black Belt", role: "your own coaches", count: share(RATIOS.black), colour: "#5b5650" },
  ];

  return (
    <div className="rounded-[22px] border border-[var(--hair-2)] bg-[var(--black-2)] p-6 shadow-2xl sm:p-7">
      <label htmlFor="planner-headcount" className="k-sub block">How many people work for you?</label>
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <input
          id="planner-headcount"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_HEADCOUNT}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="k-num w-full rounded-xl border border-[var(--hair-2)] bg-[var(--black)] px-4 py-3 text-[28px] text-[var(--warm)] sm:w-[200px] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--ember)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <div className="grid grid-cols-3 gap-2.5 sm:flex">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setInput(String(preset))}
              aria-pressed={headcount === preset}
              className={`min-h-[44px] rounded-[10px] border px-4 text-[14px] transition-colors ${
                headcount === preset
                  ? "border-[var(--warm)] bg-[var(--warm)] text-[var(--black)]"
                  : "border-[var(--hair-2)] text-[var(--warm-70)] hover:border-[var(--ember)]"
              }`}
            >
              {fmt(preset)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-[var(--hair)] pt-5" aria-live="polite">
        <p className="k-mono">Your deployment</p>
        <ul className="mt-4 space-y-3">
          {belts.map((belt) => (
            <li key={belt.name} className="grid grid-cols-[12px_minmax(0,1fr)_auto] items-baseline gap-3">
              <span className="h-3 w-3 rounded-full border border-white/30" style={{ background: belt.colour }} aria-hidden />
              <span className="text-[15px] text-[var(--warm-70)]">
                <span className="text-[var(--warm)]">{belt.name}</span>
                <span className="hidden sm:inline"> · {belt.role}</span>
              </span>
              <span className="k-num text-[22px]">{fmt(belt.count)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[var(--hair)] px-4 py-3">
            <p className="text-[13px] text-[var(--warm-70)]">Real projects in year one</p>
            <p className="k-num mt-1 text-[22px] text-[var(--signal)]">{fmt(green)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--hair)] px-4 py-3">
            <p className="text-[13px] text-[var(--warm-70)]">Green Belt waves of {WAVE_SIZE}</p>
            <p className="k-num mt-1 text-[22px] text-[var(--ember)]">{fmt(Math.ceil(green / WAVE_SIZE))}</p>
          </div>
        </div>
      </div>

      <ol className="mt-6 border-t border-[var(--hair)] pt-4">
        {year.map((step, index) => (
          <li key={step.when} className="grid grid-cols-[76px_14px_minmax(0,1fr)] items-center gap-3 py-1.5">
            <span className="k-mono">{step.when}</span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${index === year.length - 1 ? "bg-[var(--ember)]" : "bg-[var(--signal)]"}`}
              aria-hidden
            />
            <span className="text-[15px]">{step.title}</span>
          </li>
        ))}
      </ol>

      <TrackedLink href="/contact?interest=training" eventOffer="deployment enquiry" className="k-btn k-btn--solid mt-5 w-full justify-center">
        {headcount ? `Plan a deployment for ${fmt(headcount)} people` : "Plan a deployment"}
      </TrackedLink>
      <p className="mt-3 text-[12px] text-[var(--warm-50)]">Typical ratios. We size yours together.</p>
    </div>
  );
}
