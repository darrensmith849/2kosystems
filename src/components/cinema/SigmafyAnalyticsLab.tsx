"use client";

import { useState } from "react";

const charts = {
  "I-MR": {
    label: "Individuals · Moving Range",
    metrics: [["Cp", "1.42"], ["Cpk", "1.21"], ["Yield", "99.4%"], ["PPM", "128"]],
    points: "0,132 35,119 70,124 105,101 140,112 175,80 210,91 245,64 280,77 315,51 350,61 385,42 420,55 455,36 490,48 525,29 560,43 595,25 630,34 665,20 700,30",
    signal: "Process improving · one special-cause signal",
  },
  "X̄-R": {
    label: "Subgroup means · ranges",
    metrics: [["Cp", "1.61"], ["Cpk", "1.47"], ["Yield", "99.8%"], ["PPM", "54"]],
    points: "0,91 35,86 70,95 105,82 140,89 175,79 210,84 245,75 280,82 315,71 350,78 385,69 420,74 455,68 490,73 525,67 560,72 595,65 630,70 665,64 700,68",
    signal: "Stable subgroups · capability above target",
  },
  "P-chart": {
    label: "Proportion nonconforming",
    metrics: [["Mean", "1.8%"], ["UCL", "3.4%"], ["Target", "<2%"], ["Samples", "42"]],
    points: "0,68 35,81 70,58 105,76 140,62 175,89 210,71 245,96 280,73 315,84 350,101 385,91 420,108 455,97 490,114 525,103 560,119 595,107 630,122 665,112 700,120",
    signal: "Defect proportion below target for 7 periods",
  },
} as const;

type Chart = keyof typeof charts;

export default function SigmafyAnalyticsLab() {
  const [active, setActive] = useState<Chart>("I-MR");
  const chart = charts[active];

  return (
    <figure className="sfy-lab">
      <header className="sfy-bar"><span className="sfy-dots" aria-hidden="true"><i /><i /><i /></span><span>SIGMAFY · STATISTICAL ANALYSIS WORKSPACE</span><span className="sfy-saved"><i /> ANALYSIS SAVED</span></header>
      <div className="sfy-stage">
        <aside className="sfy-side"><div className="sfy-mark"><span>Σ</span><div><strong>Sigmafy</strong><small>Quality workspace</small></div></div><p>WORKSPACE</p><nav>{[["01", "Analysis"], ["02", "SPC charts"], ["03", "Projects"], ["04", "Benefits"]].map(([n, label], index) => <button key={n} type="button" data-active={index === 1}><i>{n}</i>{label}</button>)}</nav><div className="sfy-library"><span>CHART LIBRARY</span><strong>12 saved analyses</strong><small>3 shared with Project 024</small></div></aside>
        <main className="sfy-main" aria-live="polite">
          <header className="sfy-head"><div><span>PACKAGING LINE 04 · FILL WEIGHT</span><h3>Process capability</h3></div><div className="sfy-chart-tabs">{(Object.keys(charts) as Chart[]).map(key => <button key={key} type="button" data-active={active === key} onClick={() => setActive(key)}>{key}</button>)}</div></header>
          <div className="sfy-metrics">{chart.metrics.map(([name, value], index) => <article key={name}><span>{name}</span><strong>{value}</strong><small>{index === 0 ? "potential" : index === 1 ? "actual" : index === 2 ? "estimated" : "nonconforming"}</small></article>)}</div>
          <section className="sfy-chart"><header><div><span>{active} CONTROL CHART</span><strong>{chart.label}</strong></div><p><i /> {chart.signal}</p></header><div className="sfy-plot"><div className="sfy-grid" aria-hidden="true" /><span className="sfy-limit sfy-limit--ucl">UCL 503.8</span><span className="sfy-limit sfy-limit--cl">CL 500.1</span><span className="sfy-limit sfy-limit--lcl">LCL 496.4</span><svg viewBox="0 0 700 155" preserveAspectRatio="none" role="img" aria-label={`${active} illustrative control chart`}><polyline points={chart.points} fill="none" stroke="currentColor" strokeWidth="2.3" vectorEffect="non-scaling-stroke" /><circle cx="525" cy={active === "I-MR" ? "29" : active === "X̄-R" ? "67" : "103"} r="4" className="sfy-alert-point" /></svg></div><footer><span>01 SEP</span><span>PERIOD · 21 SAMPLES</span><span>13 SEP</span></footer></section>
        </main>
        <aside className="sfy-insight"><header><span>SIGNAL REVIEW</span><b>1 OPEN</b></header><div className="sfy-rule"><i>R2</i><div><strong>Nelson Rule 2</strong><p>Nine points on the same side of the centre line.</p></div></div><dl><div><dt>First observed</dt><dd>Period 15</dd></div><div><dt>Severity</dt><dd>Review</dd></div><div><dt>Linked project</dt><dd>SIG–024</dd></div></dl><section><span>ASSISTED INTERPRETATION</span><p>The sustained shift appears after the filler calibration recorded in period 14. Confirm the setup change before treating the new centre line as standard.</p><small>AI DRAFT · ANALYST APPROVAL REQUIRED</small></section><button type="button">Attach to project →</button></aside>
      </div>
      <figcaption><span>ILLUSTRATIVE SIGMAFY ANALYSIS</span><span>EXAMPLE DATA AND VALUES · NOT A CLIENT RESULT</span></figcaption>
    </figure>
  );
}
