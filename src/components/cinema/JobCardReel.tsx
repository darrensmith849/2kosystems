"use client";

import { useState } from "react";

type Mode = "dispatch" | "field" | "closeout";

const jobs = [
  { id: "JC-2048", title: "Conveyor head pulley inspection", site: "Plant 2 · Rustenburg", crew: "M. Dube + 2", time: "08:00", state: "In field", tone: "live" },
  { id: "JC-2047", title: "Pump P-17 seal replacement", site: "North shaft", crew: "T. Molefe + 1", time: "07:30", state: "Needs part", tone: "warn" },
  { id: "JC-2046", title: "Generator 4 monthly service", site: "Workshop", crew: "A. Smith", time: "09:15", state: "Scheduled", tone: "quiet" },
  { id: "JC-2045", title: "Gate motor fault call-out", site: "Depot 3", crew: "K. Naidoo", time: "10:00", state: "Scheduled", tone: "quiet" },
];

const modes: { id: Mode; label: string; meta: string }[] = [
  { id: "dispatch", label: "Dispatch", meta: "12 jobs" },
  { id: "field", label: "Field", meta: "5 active" },
  { id: "closeout", label: "Close-out", meta: "7 today" },
];

export default function JobCardReel() {
  const [mode, setMode] = useState<Mode>("dispatch");
  const [selected, setSelected] = useState(0);
  const job = jobs[selected];

  return (
    <figure className="jc-product">
      <header className="jc-product-bar">
        <div className="jc-window-dots" aria-hidden><i /><i /><i /></div>
        <span>Work order control · Northstar Field Services</span>
        <span className="jc-live"><i /> Live operation</span>
      </header>

      <div className="jc-product-stage">
        <aside className="jc-side">
          <div className="jc-brand"><i>2</i><span>FieldOS<small>Operations</small></span></div>
          <p>WORKSPACE</p>
          <nav>
            {modes.map((item) => (
              <button key={item.id} type="button" data-active={mode === item.id} onClick={() => setMode(item.id)}>
                <i>{item.id === "dispatch" ? "D" : item.id === "field" ? "F" : "✓"}</i>
                <span>{item.label}</span><b>{item.meta}</b>
              </button>
            ))}
          </nav>
          <p>SITES</p>
          <ul><li><span>Rustenburg</span><b>6</b></li><li><span>Steelpoort</span><b>3</b></li><li><span>Central</span><b>3</b></li></ul>
          <div className="jc-shift"><span>SHIFT CONTROL</span><b>92%</b><i><em /></i><small>11 of 12 jobs assigned</small></div>
        </aside>

        <main className="jc-workspace">
          <header className="jc-workspace-head">
            <div><span>13 SEPTEMBER · DAY SHIFT</span><h3>{mode === "dispatch" ? "Today’s work" : mode === "field" ? "Work in progress" : "Close-out control"}</h3></div>
            <button type="button">＋ Raise job</button>
          </header>

          <div className="jc-metrics">
            <span><small>Scheduled</small><b>12</b><em>All sites</em></span>
            <span><small>In field</small><b>05</b><em data-tone="good">Crews active</em></span>
            <span><small>Exceptions</small><b>02</b><em data-tone="warn">Owners notified</em></span>
            <span><small>Closed today</small><b>07</b><em data-tone="good">Proof attached</em></span>
          </div>

          {mode === "dispatch" && (
            <div className="jc-dispatch-view">
              <section className="jc-job-list">
                <header><span>WORK ORDER</span><span>CREW</span><span>STATUS</span></header>
                {jobs.map((item, index) => (
                  <button key={item.id} type="button" data-active={selected === index} onClick={() => setSelected(index)}>
                    <span><small>{item.id} · {item.time}</small><b>{item.title}</b><em>{item.site}</em></span>
                    <span>{item.crew}</span>
                    <span data-tone={item.tone}><i />{item.state}</span>
                  </button>
                ))}
              </section>
              <JobDetail job={job} />
            </div>
          )}

          {mode === "field" && <FieldView />}
          {mode === "closeout" && <CloseoutView />}
        </main>

        <Phone job={job} mode={mode} />
      </div>

      <figcaption><span>One job. One live status. One complete record.</span><span>Interactive illustrative interface · not a client system</span></figcaption>
    </figure>
  );
}

function JobDetail({ job }: { job: (typeof jobs)[number] }) {
  return (
    <article className="jc-job-detail">
      <header><span>{job.id}</span><b data-tone={job.tone}>{job.state}</b></header>
      <h4>{job.title}</h4>
      <p>{job.site}</p>
      <dl><div><dt>Assigned crew</dt><dd>{job.crew}</dd></div><div><dt>Planned start</dt><dd>{job.time}</dd></div><div><dt>Priority</dt><dd>Operational</dd></div></dl>
      <div className="jc-control-path"><span data-done="true"><i>✓</i><b>Raised</b></span><span data-done="true"><i>✓</i><b>Assigned</b></span><span data-now="true"><i>03</i><b>In field</b></span><span><i>04</i><b>Close</b></span></div>
      <footer><span><i /> Last field update · 8 min ago</span><button type="button">Open job →</button></footer>
    </article>
  );
}

function FieldView() {
  return (
    <div className="jc-field-view">
      <section className="jc-field-card">
        <header><div><span>JC-2048</span><h4>Conveyor head pulley inspection</h4></div><b>IN FIELD</b></header>
        <div className="jc-checks"><span data-done="true"><i>✓</i><b>Isolation confirmed</b><small>08:14 · M. Dube</small></span><span data-done="true"><i>✓</i><b>Visual inspection</b><small>3 photos attached</small></span><span data-now="true"><i>!</i><b>Bearing temperature high</b><small>76°C · threshold 70°C</small></span><span><i>04</i><b>Supervisor decision</b><small>Awaiting response</small></span></div>
      </section>
      <aside className="jc-exception"><span>EXCEPTION ROUTED</span><strong>76°C</strong><p>Bearing temperature exceeded the agreed limit. The supervisor has the reading, photo and job history.</p><div><b>Owner</b><span>P. Jacobs · Supervisor</span></div><div><b>Due</b><span>Within 30 minutes</span></div><button type="button">Review decision</button></aside>
    </div>
  );
}

function CloseoutView() {
  return (
    <div className="jc-closeout-view">
      <section className="jc-proof-card">
        <header><span>JC-2041 · COMPLETE RECORD</span><b>READY TO CLOSE</b></header>
        <h4>Hydraulic hose replacement</h4>
        <div className="jc-proof-grid"><span><small>Labour</small><b>3h 20m</b></span><span><small>Parts</small><b>R2,840</b></span><span><small>Travel</small><b>46 km</b></span><span><small>Photos</small><b>04</b></span></div>
        <ul><li><i>✓</i><span>Mandatory checks complete</span></li><li><i>✓</i><span>Parts and serial recorded</span></li><li><i>✓</i><span>Client signature attached</span></li><li><i>✓</i><span>Follow-up not required</span></li></ul>
      </section>
      <aside className="jc-signoff"><span>CLIENT SIGN-OFF</span><div className="jc-signature">L. Mokoena</div><p>Signed on site · 14:42<br />Location and timestamp recorded</p><button type="button">Close job</button></aside>
    </div>
  );
}

function Phone({ job, mode }: { job: (typeof jobs)[number]; mode: Mode }) {
  return (
    <aside className="jc-phone" aria-label="Illustrative mobile job card">
      <div className="jc-phone-top"><span>09:42</span><i /><b>4G</b></div>
      <header><span>FIELD JOB</span><b>•••</b></header>
      <div className="jc-phone-job"><small>{job.id}</small><h4>{job.title}</h4><p>{job.site}</p></div>
      <div className="jc-phone-state"><span><i />{mode === "closeout" ? "Ready to close" : mode === "field" ? "In progress" : "Assigned to you"}</span><small>Synced now</small></div>
      <div className="jc-phone-fields">
        <label><span>Reading</span><b>{mode === "field" ? "76 °C" : "Add reading"}</b></label>
        <label><span>Evidence</span><b>{mode === "closeout" ? "4 photos" : "＋ Add photo"}</b></label>
        <label><span>Parts used</span><b>{mode === "closeout" ? "2 recorded" : "＋ Add part"}</b></label>
      </div>
      <div className="jc-phone-proof"><i>✓</i><span><b>Works offline</b><small>Updates sync when signal returns</small></span></div>
      <button type="button" className="jc-phone-action">{mode === "closeout" ? "Submit close-out" : mode === "field" ? "Route exception" : "Start job"}</button>
      <div className="jc-phone-home" aria-hidden />
    </aside>
  );
}
