"use client";

import { useState } from "react";

type ItemId = "approval" | "dispatch" | "pod";

const items = [
  { id: "approval" as const, rank: "01", title: "Approval wait", value: "High", effort: "2 days", owner: "D. Nkosi", state: "Active" },
  { id: "dispatch" as const, rank: "02", title: "Dispatch handoff", value: "Medium", effort: "1 day", owner: "T. Dlamini", state: "Ready" },
  { id: "pod" as const, rank: "03", title: "Proof-of-delivery gaps", value: "Medium", effort: "2 days", owner: "J. Mokoena", state: "Qualify" },
];

const interventions = {
  approval: { title: "Reduce approval waiting", constraint: "Orders above R50,000 wait for a manually forwarded email.", change: "Route by value and authority; escalate after 90 minutes.", measure: "Median approval wait", baseline: "2.8h", target: "≤ 1.5h" },
  dispatch: { title: "Stabilise dispatch handoff", constraint: "Warehouse readiness is confirmed in two separate message threads.", change: "Create one readiness state with a named release owner.", measure: "Handoff delay", baseline: "46m", target: "≤ 20m" },
  pod: { title: "Close proof-of-delivery gaps", constraint: "Missing documents are discovered during weekly reconciliation.", change: "Validate evidence at completion and route gaps immediately.", measure: "Complete POD records", baseline: "91%", target: "≥ 98%" },
} satisfies Record<ItemId, { title: string; constraint: string; change: string; measure: string; baseline: string; target: string }>;

export default function ImprovementCommandCentre() {
  const [selected, setSelected] = useState<ItemId>("approval");
  const current = interventions[selected];

  return (
    <figure id="improvement-command-centre" className="mi-command">
      <header className="mi-command-bar">
        <div className="mi-window-dots" aria-hidden><i /><i /><i /></div>
        <span>Operational excellence portfolio · Quarter 02</span>
        <div className="mi-command-state"><i /> Partnership live</div>
      </header>

      <div className="mi-command-body">
        <aside className="mi-side">
          <div className="mi-brand"><i>2</i><span>2KO partnership<br /><small>Operating centre</small></span></div>
          <p>PORTFOLIO</p>
          <button type="button" className="mi-process-select"><span>Order to dispatch<small>Workstream 01 of 02</small></span><i>⌄</i></button>
          <nav aria-label="Illustrative improvement workspace navigation">
            <button type="button" data-active="true"><i>◫</i><span>Process scorecard</span></button>
            <button type="button"><i>↗</i><span>Automation releases</span><b>2</b></button>
            <button type="button"><i>≡</i><span>Capability plan</span><b>18</b></button>
            <button type="button"><i>Σ</i><span>Sigmafy evidence</span></button>
            <button type="button"><i>✓</i><span>Benefits register</span></button>
          </nav>
          <div className="mi-owner"><span>DN</span><small>Process owner<br /><b>D. Nkosi</b></small></div>
        </aside>

        <section className="mi-main">
          <header className="mi-main-head">
            <div><small>PROCESS SCORECARD</small><h3>Order to dispatch</h3></div>
            <div><span>01–30 April</span><button type="button">Monthly review · 2 days</button></div>
          </header>

          <div className="mi-metrics">
            <article><small>Active workstreams</small><strong>02</strong><span data-tone="good">On programme</span></article>
            <article><small>Learners progressing</small><strong>18</strong><span data-tone="good">14 on track</span></article>
            <article><small>Automation releases</small><strong>03</strong><span data-tone="warn">1 in review</span></article>
            <article><small>Verified benefit</small><strong>R1.42m</strong><span data-tone="good">Sigmafy record</span></article>
          </div>

          <div className="mi-workspace">
            <article className="mi-trend">
              <header><div><span>Cycle-time movement</span><small>12-week view · lower is better</small></div><b>Target ≤ 4.5h</b></header>
              <div className="mi-chart">
                <div className="mi-chart-labels"><span>8h</span><span>6h</span><span>4h</span><span>2h</span></div>
                <svg viewBox="0 0 520 154" role="img" aria-label="Illustrative cycle time falling from 7.2 hours to 4.2 hours across twelve weeks">
                  <defs><linearGradient id="mi-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6a8cff" stopOpacity=".27" /><stop offset="1" stopColor="#6a8cff" stopOpacity="0" /></linearGradient></defs>
                  <line x1="0" x2="520" y1="91" y2="91" className="mi-target-line" />
                  <path d="M0 27 L47 34 L94 31 L141 49 L188 58 L235 67 L282 74 L329 81 L376 88 L423 94 L470 101 L520 106 L520 154 L0 154 Z" fill="url(#mi-area)" />
                  <polyline points="0,27 47,34 94,31 141,49 188,58 235,67 282,74 329,81 376,88 423,94 470,101 520,106" className="mi-trend-line" />
                  <circle cx="520" cy="106" r="5" className="mi-current-dot" />
                </svg>
                <div className="mi-chart-weeks"><span>W01</span><span>W04</span><span>W08</span><span>W12</span></div>
              </div>
            </article>

            <article className="mi-active">
              <header><span>ACTIVE INTERVENTION</span><b>Improve</b></header>
              <h4>{current.title}</h4>
              <dl><div><dt>Constraint</dt><dd>{current.constraint}</dd></div><div><dt>Change</dt><dd>{current.change}</dd></div></dl>
              <div className="mi-measure"><span><small>{current.measure}</small><b>{current.baseline}</b></span><i>→</i><span><small>Target</small><b>{current.target}</b></span></div>
              <ol><li data-done="true">Measure</li><li data-done="true">Select</li><li data-active="true">Improve</li><li>Verify</li></ol>
            </article>
          </div>

          <section className="mi-backlog">
            <header><div><span>Prioritised improvement backlog</span><small>Value × confidence ÷ effort</small></div><button type="button">View all 6</button></header>
            <div className="mi-backlog-head"><span>Rank</span><span>Constraint</span><span>Value</span><span>Effort</span><span>Owner</span><span>Status</span></div>
            {items.map((item) => (
              <button key={item.id} type="button" data-active={selected === item.id} onClick={() => setSelected(item.id)}>
                <span>{item.rank}</span><span><i />{item.title}</span><span>{item.value}</span><span>{item.effort}</span><span>{item.owner}</span><span data-state={item.state.toLowerCase()}>{item.state}</span>
              </button>
            ))}
          </section>
        </section>

        <aside className="mi-cadence">
          <header><div><small>OPERATING CADENCE</small><strong>Quarter 02</strong></div><span><i /> On rhythm</span></header>
          <ol className="mi-calendar">
            <li data-done="true"><time>03 Apr</time><i /><div><b>Measure</b><span>Sigmafy baseline refreshed</span></div></li>
            <li data-done="true"><time>08 Apr</time><i /><div><b>Train</b><span>Green Belt coaching</span></div></li>
            <li data-active="true"><time>12 Apr</time><i /><div><b>Automate</b><span>Routing release live</span></div></li>
            <li><time>30 Apr</time><i /><div><b>Review</b><span>Sponsor benefit decision</span></div></li>
          </ol>
          <article className="mi-next-review"><span>NEXT REVIEW</span><h4>Tuesday · 09:00</h4><p>Scorecard, active intervention, benefit check and next constraint.</p><div><i>DN</i><i>JM</i><i>2K</i><small>3 attendees</small></div></article>
          <section className="mi-decisions"><header><span>Latest decisions</span><small>Full record →</small></header><p><time>05 Apr</time>Approval wait selected</p><p><time>03 Apr</time>Baseline accepted</p></section>
        </aside>
      </div>

      <figcaption><span>Improve · train · automate · measure · one operating record</span><span>Illustrative interface and records — not a client result.</span></figcaption>
    </figure>
  );
}
