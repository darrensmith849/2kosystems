"use client";

import { useState } from "react";

const views = [
  {
    id: "improve",
    label: "Improve",
    eyebrow: "PROCESS PERFORMANCE",
    metric: "18.4h",
    metricLabel: "cycle time · down 31%",
    signal: "Constraint isolated",
    rows: [
      ["Intake", "Owner assigned", "12m"],
      ["Validate", "Duplicate capture removed", "1.8h"],
      ["Approve", "Threshold route active", "6.2h"],
      ["Close", "Evidence attached", "10.2h"],
    ],
  },
  {
    id: "train",
    label: "Train",
    eyebrow: "CAPABILITY PIPELINE",
    metric: "24 / 28",
    metricLabel: "delegates on track",
    signal: "Projects in application",
    rows: [
      ["Define", "Cohort complete", "100%"],
      ["Measure", "Projects evidenced", "86%"],
      ["Analyse", "Coach review", "72%"],
      ["Control", "Benefits sign-off", "54%"],
    ],
  },
  {
    id: "automate",
    label: "Automate",
    eyebrow: "WORKFLOW CONTROL",
    metric: "73%",
    metricLabel: "manual touches removed",
    signal: "Human authority retained",
    rows: [
      ["REQ–2418", "Rule validated · routed", "AUTO"],
      ["REQ–2419", "Limit exceeded · review", "HUMAN"],
      ["REQ–2420", "Evidence complete · closed", "AUTO"],
      ["REQ–2421", "Exception · escalated", "HUMAN"],
    ],
  },
  {
    id: "measure",
    label: "Measure",
    eyebrow: "SIGMAFY · BENEFITS REGISTER",
    metric: "1.41",
    metricLabel: "process capability · Cpk",
    signal: "Improvement holding",
    rows: [
      ["Yield", "Current operating period", "96.8%"],
      ["Variation", "Within control limits", "−22%"],
      ["Benefit", "Verified to source", "R684k"],
      ["Sustain", "Control owner active", "91d"],
    ],
  },
] as const;

export default function GroupOperatingSystem() {
  const [activeId, setActiveId] = useState<(typeof views)[number]["id"]>("improve");
  const active = views.find((view) => view.id === activeId) ?? views[0];

  return (
    <div className="gos-wrap">
      <div className="gos-window">
        <div className="gos-topbar">
          <span className="gos-lights" aria-hidden="true"><i /><i /><i /></span>
          <span>2KO · IMPROVEMENT OPERATING SYSTEM</span>
          <span className="gos-live"><i /> LIVE MODEL</span>
        </div>

        <div className="gos-body">
          <aside className="gos-rail">
            <div className="gos-account"><span>2K</span><div><strong>Marula Operations</strong><small>Group workspace</small></div></div>
            <nav aria-label="Operating system view">
              {views.map((view, index) => (
                <button
                  key={view.id}
                  type="button"
                  data-active={activeId === view.id}
                  onClick={() => setActiveId(view.id)}
                >
                  <span>0{index + 1}</span>{view.label}
                </button>
              ))}
            </nav>
            <div className="gos-rail-foot"><span>ACCOUNTABLE LOOP</span><strong>One record.<br />Four capabilities.</strong></div>
          </aside>

          <main className="gos-main" aria-live="polite">
            <header className="gos-main-head">
              <div><span>{active.eyebrow}</span><h3>{active.label}</h3></div>
              <div className="gos-state"><i /> {active.signal}</div>
            </header>

            <div className="gos-metrics">
              <article><span>PRIMARY READOUT</span><strong>{active.metric}</strong><small>{active.metricLabel}</small></article>
              <article className="gos-chart"><span>12-WEEK SIGNAL</span><div className="gos-bars" aria-hidden="true">{[38, 50, 43, 62, 58, 72, 68, 79, 74, 88, 84, 94].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><small>trend · controlled</small></article>
              <article><span>NEXT REVIEW</span><strong className="gos-small-value">Thursday</strong><small>09:00 · owners confirmed</small></article>
            </div>

            <div className="gos-table">
              <div className="gos-table-head"><span>WORKSTREAM</span><span>CONTROL / STATUS</span><span>READOUT</span></div>
              {active.rows.map(([name, status, value], index) => (
                <div className="gos-row" key={name}>
                  <span><i data-tone={index === 1 ? "warn" : "good"} />{name}</span>
                  <span>{status}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <footer className="gos-foot"><span>Improve</span><i /> <span>Train</span><i /> <span>Automate</span><i /> <span>Measure</span><b>CONTINUOUS</b></footer>
          </main>
        </div>
      </div>
      <div className="gos-caption"><span>ILLUSTRATIVE 2KO OPERATING MODEL</span><span>EXAMPLE RECORDS AND VALUES · NOT A CLIENT RESULT</span></div>
    </div>
  );
}
