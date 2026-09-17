"use client";

import { useState } from "react";

const records = {
  "SYS–01": {
    title: "Operational systemisation case",
    process: "Approval and field-work workflow",
    progress: "4 / 6",
    note: "Sustained period and client permission remain open.",
    gates: ["ready", "ready", "ready", "open", "ready", "open"],
  },
  "GRP–01": {
    title: "2KO Group operating platform",
    process: "Internal improvement operating system",
    progress: "5 / 6",
    note: "Privacy review remains open before publication.",
    gates: ["ready", "ready", "ready", "ready", "ready", "open"],
  },
  "MIP–01": {
    title: "Integrated partnership protocol",
    process: "One operating portfolio across four levers",
    progress: "2 / 6",
    note: "Baseline client and pilot process still to be selected.",
    gates: ["open", "ready", "open", "open", "ready", "open"],
  },
} as const;

type RecordKey = keyof typeof records;
const gateNames = ["Baseline", "Mechanism", "Comparison", "Sustained", "Attribution", "Permission"];

export default function EvidenceRoom() {
  const [selected, setSelected] = useState<RecordKey>("SYS–01");
  const record = records[selected];

  return (
    <figure className="ev-room" aria-label="Illustrative evidence room showing how results are held until proof is complete">
      <div className="ev-topbar">
        <span className="ev-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>2KO EVIDENCE ROOM · PUBLICATION CONTROL</span>
        <span className="ev-lock">⌾ CLAIMS LOCKED</span>
      </div>
      <div className="ev-body">
        <aside className="ev-index">
          <header><span>PROOF INDEX</span><b>03 records</b></header>
          <nav aria-label="Illustrative evidence records">
            {(Object.keys(records) as RecordKey[]).map((key) => (
              <button key={key} type="button" data-active={selected === key} onClick={() => setSelected(key)}>
                <span><b>{key}</b><small>{records[key].title}</small></span><i>→</i>
              </button>
            ))}
          </nav>
          <div className="ev-policy"><span>PUBLICATION RULE</span><p>All six gates must hold before a numerical outcome becomes a public claim.</p></div>
        </aside>

        <section className="ev-desk">
          <header className="ev-desk-head"><div><small>SELECTED EVIDENCE RECORD</small><h3>{selected}</h3></div><span>EVIDENCE HOLD</span></header>
          <article className="ev-paper">
            <div className="ev-paper-top"><span>RESULT RECORD · CONTROLLED COPY</span><span>REV 0.4</span></div>
            <p className="ev-paper-label">BOUNDED PROCESS</p>
            <h4>{record.process}</h4>
            <div className="ev-claim-block">
              <span>PUBLIC OUTCOME CLAIM</span>
              <strong>WITHHELD</strong>
              <p>{record.note}</p>
            </div>
            <div className="ev-measure-grid">
              <div><span>BASELINE</span><b>[ controlled measure ]</b><small>definition · period · source</small></div>
              <i>→</i>
              <div><span>COMPARISON</span><b>[ same measure ]</b><small>same basis · operating period</small></div>
            </div>
            <div className="ev-source-line"><span>CHAIN OF CUSTODY</span><b>Event source → definition → calculation → reviewer</b></div>
            <div className="ev-stamp">NOT YET PUBLISHABLE</div>
          </article>
        </section>

        <aside className="ev-gates">
          <header><div><span>PUBLICATION GATE</span><b>{record.progress} complete</b></div><div className="ev-ring" style={{ "--progress": Number(record.progress[0]) } as React.CSSProperties}><span>{record.progress}</span></div></header>
          <ol>
            {gateNames.map((gate, index) => (
              <li key={gate} data-state={record.gates[index]}><i>{record.gates[index] === "ready" ? "✓" : "·"}</i><span><b>{gate}</b><small>{record.gates[index] === "ready" ? "Evidence attached" : "Required before publish"}</small></span></li>
            ))}
          </ol>
          <div className="ev-decision"><span>PUBLICATION DECISION</span><strong>HOLD</strong><p>No unsupported number leaves this room.</p></div>
        </aside>
      </div>
      <figcaption><span>BASELINE → CHANGE → COMPARISON → SUSTAIN → APPROVE</span><span>LIVE PUBLICATION STANDARD · RECORDS SHOWN ARE CANDIDATES, NOT RESULTS.</span></figcaption>
    </figure>
  );
}
