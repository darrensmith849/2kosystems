"use client";

import { useState } from "react";

const workspaces = {
  operations: {
    label: "Operations",
    code: "WO–2471",
    title: "Pump inspection · North plant",
    owner: "T. Dlamini",
    due: "Today · 14:30",
    site: "North plant",
    state: "In progress",
    evidence: "5 / 6",
    exception: "Pressure reading needs review",
    feed: ["Technician accepted work order", "Site arrival verified", "Inspection evidence uploaded"],
  },
  safety: {
    label: "Safety",
    code: "INC–0814",
    title: "Near-miss review · Loading bay",
    owner: "N. Mokoena",
    due: "Today · 16:00",
    site: "Loading bay 03",
    state: "Awaiting review",
    evidence: "4 / 4",
    exception: "Supervisor sign-off outstanding",
    feed: ["Incident captured on site", "Witness statement attached", "SHEQ review assigned"],
  },
  assets: {
    label: "Assets",
    code: "AST–1092",
    title: "Forklift service · Unit FL-09",
    owner: "P. Jacobs",
    due: "Tomorrow · 09:00",
    site: "Distribution centre",
    state: "Scheduled",
    evidence: "2 / 5",
    exception: "Service kit stock unconfirmed",
    feed: ["Service interval reached", "Approved vendor selected", "Workshop slot reserved"],
  },
} as const;

type Workspace = keyof typeof workspaces;

export default function SystemsControlPlane() {
  const [active, setActive] = useState<Workspace>("operations");
  const item = workspaces[active];

  return (
    <figure className="sc-plane" aria-label="Illustrative operational system connecting work, controls, evidence and reporting">
      <div className="sc-topbar">
        <span className="sc-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>2KO OPERATIONS OS · CONTROL PLANE</span>
        <span className="sc-live"><i /> ALL SERVICES HEALTHY</span>
      </div>

      <div className="sc-body">
        <aside className="sc-sidebar">
          <div className="sc-brand"><b>2</b><span>Operations OS<small>One operating record</small></span></div>
          <p>WORKSPACES</p>
          <nav aria-label="Illustrative system workspaces">
            {(Object.keys(workspaces) as Workspace[]).map((key, index) => (
              <button key={key} type="button" data-active={active === key} onClick={() => setActive(key)}>
                <i>0{index + 1}</i><span>{workspaces[key].label}<small>{index === 0 ? "12 live records" : index === 1 ? "3 open reviews" : "184 controlled items"}</small></span>
              </button>
            ))}
          </nav>
          <p>SYSTEM</p>
          <ul>
            <li><i>⌁</i> Work queue</li><li><i>⌘</i> Approvals</li><li><i>◎</i> Reports</li><li><i>⚙</i> Controls</li>
          </ul>
          <div className="sc-user"><b>DN</b><span>D. Nkosi<small>Process owner</small></span></div>
        </aside>

        <section className="sc-workspace">
          <header className="sc-workspace-head">
            <div><small>{item.label.toUpperCase()} / LIVE RECORD</small><h3>{item.code}</h3></div>
            <div><span>Share</span><button type="button">Update record</button></div>
          </header>

          <div className="sc-metrics">
            <span><small>Owner</small><b>{item.owner}</b></span>
            <span><small>Due</small><b>{item.due}</b></span>
            <span><small>Evidence</small><b>{item.evidence}</b></span>
            <span><small>Status</small><b data-tone="good">{item.state}</b></span>
          </div>

          <div className="sc-flow">
            {["Request", "Validate", "Assign", "Execute", "Close"].map((step, index) => (
              <div key={step} data-state={index < 3 ? "done" : index === 3 ? "active" : "next"}>
                <i>{index < 3 ? "✓" : `0${index + 1}`}</i><span>{step}<small>{index < 3 ? "recorded" : index === 3 ? "in progress" : "controlled"}</small></span>
              </div>
            ))}
          </div>

          <div className="sc-record-grid">
            <article className="sc-record">
              <header><span>PRIMARY RECORD</span><span className="sc-status"><i /> {item.state}</span></header>
              <h4>{item.title}</h4>
              <dl>
                <div><dt>Site</dt><dd>{item.site}</dd></div>
                <div><dt>Responsible</dt><dd>{item.owner}</dd></div>
                <div><dt>Service target</dt><dd>{item.due}</dd></div>
                <div><dt>Evidence pack</dt><dd>{item.evidence} complete</dd></div>
              </dl>
              <div className="sc-exception"><span>CONTROL CHECK</span><p>{item.exception}</p><button type="button">Review →</button></div>
            </article>

            <article className="sc-activity">
              <header><span>ACTIVITY</span><span>LIVE</span></header>
              <ol>
                {item.feed.map((event, index) => <li key={event}><i data-latest={index === 2} /><time>{["08:12", "09:04", "10:26"][index]}</time><span>{event}<small>{index === 2 ? "Evidence recorded" : "System event"}</small></span></li>)}
              </ol>
              <footer><span>Next: resolve control check</span><b>1 action</b></footer>
            </article>
          </div>

          <div className="sc-foundation">
            <span><small>CAPTURE</small>Mobile + web</span><i>→</i><span><small>ONE RECORD</small>Rules + ownership</span><i>→</i><span><small>AUTOMATE</small>Route + escalate</span><i>→</i><span><small>SEE</small>Live reporting</span>
          </div>
        </section>

        <aside className="sc-rail">
          <div className="sc-rail-title"><span>SYSTEM MAP</span><b>Connected</b></div>
          <div className="sc-core"><small>AUTHORITATIVE RECORD</small><strong>{item.code}</strong><span>Current · owned · traceable</span></div>
          <div className="sc-connectors">
            <p>CONNECTED SERVICES</p>
            {["ERP / finance", "Email + messaging", "Document store", "Reporting layer"].map((name, index) => <div key={name}><i data-tone={index < 3 ? "good" : "sync"} /> <span>{name}</span><small>{index < 3 ? "LIVE" : "SYNC"}</small></div>)}
          </div>
          <div className="sc-control"><span>ACCESS CONTROL</span><div><b>Ops</b><b>Client</b><b>Exec</b></div><p>Role-based views · full audit trail</p></div>
          <div className="sc-rail-foot"><span><i /> Last sync</span><b>12 sec ago</b></div>
        </aside>
      </div>

      <figcaption><span>CAPTURE → CONTROL → AUTOMATE → REPORT</span><span>ILLUSTRATIVE INTERFACE AND RECORDS — NOT A CLIENT RESULT.</span></figcaption>
    </figure>
  );
}
