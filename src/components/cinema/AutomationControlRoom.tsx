"use client";

import { useState } from "react";

type RunId = "4471" | "4468" | "4462";

const runs: Array<{ id: RunId; source: string; value: string; state: string; tone: string }> = [
  { id: "4471", source: "Supplier invoice", value: "R68,400", state: "Approval", tone: "human" },
  { id: "4468", source: "Supplier invoice", value: "R12,780", state: "Completed", tone: "done" },
  { id: "4462", source: "Supplier invoice", value: "R91,200", state: "Exception", tone: "alert" },
];

const detail = {
  "4471": { title: "Human approval required", note: "Value exceeds the R50,000 authority threshold.", owner: "Ops Director", action: "Decision task issued", time: "4 sec" },
  "4468": { title: "Completed by rule", note: "Verified value remained inside the automatic approval limit.", owner: "System rule", action: "Record written", time: "2 sec" },
  "4462": { title: "Exception isolated", note: "Purchase-order total does not match the invoice value.", owner: "Finance queue", action: "Evidence attached", time: "7 sec" },
} satisfies Record<RunId, { title: string; note: string; owner: string; action: string; time: string }>;

export default function AutomationControlRoom() {
  const [selected, setSelected] = useState<RunId>("4471");
  const current = detail[selected];

  return (
    <figure id="automation-control-room" className="au-control-room">
      <header className="au-room-bar">
        <div className="au-window-dots" aria-hidden><i /><i /><i /></div>
        <span>Workflow 07 · Invoice approval</span>
        <div className="au-room-state"><i /> Production · live</div>
      </header>

      <div className="au-room-body">
        <aside className="au-flow-list">
          <div className="au-flow-brand"><i>2</i><span>Automation<br /><small>Control room</small></span></div>
          <p>WORKFLOWS</p>
          <nav aria-label="Illustrative automation workflows">
            <button type="button" data-active="true"><i>01</i><span>Invoice approval<small>Running now</small></span><b>24</b></button>
            <button type="button"><i>02</i><span>Incident escalation<small>Monitoring</small></span></button>
            <button type="button"><i>03</i><span>Contractor expiry<small>Daily schedule</small></span></button>
            <button type="button"><i>04</i><span>Month-end pack<small>Next: 30 Sep</small></span></button>
          </nav>
          <div className="au-system-health"><span><i /> All systems operational</span><small>Last checked now</small></div>
        </aside>

        <section className="au-canvas" aria-label="Invoice approval workflow diagram">
          <header className="au-canvas-head">
            <div><small>LIVE WORKFLOW</small><h3>Invoice approval</h3></div>
            <div><span>−</span><span>100%</span><span>＋</span><button type="button">Edit workflow</button></div>
          </header>

          <div className="au-flow-canvas">
            <div className="au-canvas-grid" aria-hidden />
            <article className="au-node au-node--trigger">
              <header><i>01</i><span>TRIGGER</span><b data-tone="good">Received</b></header>
              <h4>Invoice enters</h4><p>Email or supplier portal</p>
              <footer><span>Request #{selected}</span><em>09:14:02</em></footer>
            </article>
            <div className="au-connector au-connector--one" aria-hidden><i /></div>
            <article className="au-node au-node--validate">
              <header><i>02</i><span>VALIDATE</span><b data-tone="good">3 / 3</b></header>
              <h4>Check the evidence</h4>
              <ul><li><i />Supplier recognised</li><li><i />PO reference exists</li><li><i />Value reconciled</li></ul>
            </article>
            <div className="au-connector au-connector--two" aria-hidden><i /></div>
            <article className="au-node au-node--decide">
              <header><i>03</i><span>DECIDE</span><b data-tone="warn">Threshold</b></header>
              <h4>Who holds authority?</h4><p>Value is above R50,000</p>
              <footer><span>{runs.find((run) => run.id === selected)?.value}</span><em>Rule matched</em></footer>
            </article>
            <div className="au-branch au-branch--system" aria-hidden><span>≤ R50k</span><i /></div>
            <div className="au-branch au-branch--human" aria-hidden><span>&gt; R50k</span><i /></div>
            <article className="au-node au-node--system">
              <header><i>04A</i><span>SYSTEM</span></header><h4>Approve by rule</h4><p>Post verified outcome</p>
            </article>
            <article className="au-node au-node--human">
              <header><i>04B</i><span>HUMAN</span><b data-tone="human">Waiting</b></header><h4>Ops Director</h4><p>Evidence and reason attached</p>
              <footer><span>Decision required</span><em>22 min SLA</em></footer>
            </article>
            <article className="au-node au-node--record">
              <header><i>05</i><span>RECORD</span><b>Pending</b></header><h4>Write the evidence</h4><p>Outcome, owner, time and source</p>
            </article>
          </div>
        </section>

        <aside className="au-run-panel">
          <header><div><small>LIVE RUNS</small><strong>24 today</strong></div><span><i /> Listening</span></header>
          <div className="au-run-list">
            {runs.map((run) => (
              <button key={run.id} type="button" data-active={selected === run.id} onClick={() => setSelected(run.id)}>
                <span><b>#{run.id}</b><small>{run.source}</small></span>
                <span><b>{run.value}</b><small data-tone={run.tone}><i />{run.state}</small></span>
              </button>
            ))}
          </div>
          <article className="au-run-detail">
            <span>RUN #{selected}</span><h4>{current.title}</h4><p>{current.note}</p>
            <dl><div><dt>Owner</dt><dd>{current.owner}</dd></div><div><dt>Action</dt><dd>{current.action}</dd></div><div><dt>Elapsed</dt><dd>{current.time}</dd></div></dl>
          </article>
          <footer><span><b>22</b><small>completed</small></span><span><b>01</b><small>human</small></span><span><b>01</b><small>exception</small></span></footer>
        </aside>
      </div>

      <figcaption><span>Trigger → validate → decide → act → record</span><span>Illustrative interface and records — not a client result.</span></figcaption>
    </figure>
  );
}
