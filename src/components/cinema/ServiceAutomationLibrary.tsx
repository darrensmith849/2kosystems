"use client";

import { useState } from "react";

const workflows = {
  onboarding: {
    code: "FIN–01",
    title: "Client onboarding",
    sector: "Financial services",
    volume: "64 cases today",
    accent: "cyan",
    trigger: { label: "Application submitted", meta: "Portal · branch · adviser" },
    automations: [
      { code: "01", title: "Read the application", body: "Extract the company, directors and product request." },
      { code: "02", title: "Verify the evidence", body: "Check completeness, identity and screening sources." },
      { code: "03", title: "Route by confidence", body: "Straight-through where rules hold; isolate uncertainty." },
    ],
    boundary: { owner: "Compliance officer", reason: "Ownership declaration needs interpretation", sla: "42 min remaining" },
    output: { title: "Decision-ready case", body: "One verified pack with source, owner and timestamps." },
    measures: ["Completion time", "First-time-right", "Exception rate", "Human touch time"],
  },
  claims: {
    code: "INS–02",
    title: "Claim triage",
    sector: "Insurance",
    volume: "38 claims today",
    accent: "violet",
    trigger: { label: "New claim received", meta: "App · email · call centre" },
    automations: [
      { code: "01", title: "Assemble the claim", body: "Link policy, claimant, incident and attachments." },
      { code: "02", title: "Apply triage rules", body: "Test cover, severity, duplication and missing evidence." },
      { code: "03", title: "Set the pathway", body: "Fast-track simple claims and surface specialist cases." },
    ],
    boundary: { owner: "Claims assessor", reason: "Declared loss exceeds the delegated threshold", sla: "1h 16m remaining" },
    output: { title: "Prioritised claim", body: "Assigned pathway, next action and complete decision trail." },
    measures: ["Time to triage", "Rework rate", "Queue ageing", "Escalation quality"],
  },
  escalation: {
    code: "CX–03",
    title: "Customer escalation",
    sector: "Customer operations",
    volume: "12 escalations live",
    accent: "amber",
    trigger: { label: "Service risk detected", meta: "Repeat contact · low score · keyword" },
    automations: [
      { code: "01", title: "Gather the context", body: "Bring the transcript, history and prior commitments together." },
      { code: "02", title: "Classify the failure", body: "Identify urgency, likely cause and service owner." },
      { code: "03", title: "Prepare the recovery", body: "Draft the response and route the accountable action." },
    ],
    boundary: { owner: "Service team lead", reason: "A fee reversal needs accountable approval", sla: "18 min remaining" },
    output: { title: "Owned recovery", body: "Customer response, remedy and cause code recorded together." },
    measures: ["Time to ownership", "Repeat contacts", "Recovery SLA", "Cause recurrence"],
  },
  monthEnd: {
    code: "FIN–04",
    title: "Month-end reporting",
    sector: "Finance and accounting",
    volume: "5 close tasks open",
    accent: "green",
    trigger: { label: "Close window opens", meta: "Scheduled · source ledgers ready" },
    automations: [
      { code: "01", title: "Collect the sources", body: "Pull controlled balances and supporting schedules." },
      { code: "02", title: "Reconcile and test", body: "Match accounts, thresholds and prior-period movements." },
      { code: "03", title: "Build the pack", body: "Prepare commentary and surface unresolved variances." },
    ],
    boundary: { owner: "Financial controller", reason: "Revenue variance requires management explanation", sla: "3h 05m remaining" },
    output: { title: "Controlled close pack", body: "Reviewed numbers, commentary and approvals in one record." },
    measures: ["Close duration", "Open variances", "Manual journals", "Review effort"],
  },
} as const;

type WorkflowKey = keyof typeof workflows;

export default function ServiceAutomationLibrary() {
  const [active, setActive] = useState<WorkflowKey>("onboarding");
  const workflow = workflows[active];

  return (
    <figure className="sa-studio" data-accent={workflow.accent} aria-label="Interactive service automation workflow library">
      <header className="sa-topbar">
        <span className="sa-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>2KO AUTOMATION STUDIO · SERVICE WORKFLOWS</span>
        <span className="sa-status"><i /> FOUR PATTERNS READY</span>
      </header>

      <nav className="sa-tabs" aria-label="Choose an illustrative service workflow">
        {(Object.keys(workflows) as WorkflowKey[]).map((key, index) => {
          const item = workflows[key];
          return (
            <button key={key} type="button" data-active={active === key} onClick={() => setActive(key)}>
              <span>0{index + 1} · {item.code}</span><strong>{item.title}</strong><small>{item.sector}</small><i aria-hidden="true">→</i>
            </button>
          );
        })}
      </nav>

      <div className="sa-stage">
        <aside className="sa-signal">
          <span>TRIGGER</span>
          <div className="sa-signal-icon" aria-hidden="true"><i /><i /><b>↳</b></div>
          <h3>{workflow.trigger.label}</h3>
          <p>{workflow.trigger.meta}</p>
          <div><i /> Event accepted<small>Source recorded · now</small></div>
        </aside>

        <main className="sa-orchestration">
          <header><div><small>ACTIVE ORCHESTRATION</small><h3>{workflow.title}</h3></div><span>{workflow.code} · {workflow.volume}</span></header>
          <div className="sa-lanes">
            <p><span>AUTOMATION LANE</span><i /></p>
            <ol>
              {workflow.automations.map((step, index) => (
                <li key={step.code}>
                  <i>{step.code}</i><div><span>{index === 0 ? "CAPTURE" : index === 1 ? "CONTROL" : "ROUTE"}</span><h4>{step.title}</h4><p>{step.body}</p></div><b>{index < 2 ? "✓" : "LIVE"}</b>
                </li>
              ))}
            </ol>
            <article className="sa-human">
              <div className="sa-human-mark"><span>HB</span><i /></div>
              <div><span>HUMAN BOUNDARY</span><h4>{workflow.boundary.owner}</h4><p>{workflow.boundary.reason}</p></div>
              <aside><small>SERVICE TARGET</small><strong>{workflow.boundary.sla}</strong><button type="button">Open decision <i>→</i></button></aside>
            </article>
          </div>
        </main>

        <aside className="sa-output">
          <span>CONTROLLED OUTPUT</span>
          <div className="sa-record-mark" aria-hidden="true"><i /><i /><i /><b>✓</b></div>
          <h3>{workflow.output.title}</h3>
          <p>{workflow.output.body}</p>
          <dl><div><dt>Owner</dt><dd>Named</dd></div><div><dt>Source</dt><dd>Linked</dd></div><div><dt>Decision</dt><dd>Recorded</dd></div><div><dt>Exception</dt><dd>Visible</dd></div></dl>
          <div className="sa-output-state"><i /> Ready for the next action</div>
        </aside>
      </div>

      <footer className="sa-measures">
        <span>MEASURE THE FLOW</span>
        {workflow.measures.map((measure, index) => <p key={measure}><i>0{index + 1}</i>{measure}</p>)}
      </footer>
      <figcaption><span>EVENT → VALIDATE → ORCHESTRATE → HUMAN BOUNDARY → RECORD</span><span>INTERACTIVE ILLUSTRATION · SYNTHETIC STATES · NOT A CLIENT RESULT</span></figcaption>
    </figure>
  );
}
