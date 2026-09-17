"use client";

import { useState } from "react";

const workspaces = {
  onboarding: {
    code: "ONB–2048",
    label: "Client onboarding",
    sector: "Banking · professional services",
    accent: "cyan",
    subject: "Amandla Trade Services",
    subtitle: "Business account · Gauteng",
    owner: "Lerato M.",
    due: "Today · 15:30",
    progress: "72%",
    stage: "Compliance review",
    stages: ["Application", "Evidence", "Verification", "Decision", "Activation"],
    activeStage: 2,
    facts: [["Registration", "2021 / 482901 / 07"], ["Directors", "3 verified"], ["Risk tier", "Standard"], ["Source", "Adviser portal"]],
    evidence: [
      { name: "Company registration", meta: "CIPC · verified", state: "ready" },
      { name: "Director identity pack", meta: "3 of 3 matched", state: "ready" },
      { name: "Ownership declaration", meta: "Review requested", state: "review" },
    ],
    activity: ["Application assembled from four sources", "Identity checks completed automatically", "Ownership exception assigned to compliance"],
    control: "Human interpretation is required before the account can be activated.",
    measure: "4.2h",
    measureLabel: "median completion",
  },
  claims: {
    code: "CLM–7714",
    label: "Cases & claims",
    sector: "Insurance · shared services",
    accent: "violet",
    subject: "Commercial property claim",
    subtitle: "Storm damage · Cape Town",
    owner: "David K.",
    due: "Tomorrow · 10:00",
    progress: "58%",
    stage: "Assessment",
    stages: ["Notify", "Validate", "Assess", "Decide", "Settle"],
    activeStage: 2,
    facts: [["Policy", "COM–184290"], ["Exposure", "R286 000"], ["Priority", "High"], ["Source", "Broker portal"]],
    evidence: [
      { name: "Policy and schedule", meta: "Cover confirmed", state: "ready" },
      { name: "Loss photographs", meta: "12 files linked", state: "ready" },
      { name: "Assessor report", meta: "Due tomorrow", state: "waiting" },
    ],
    activity: ["Claim matched to an active policy", "Severity threshold raised the priority", "Independent assessor appointed"],
    control: "Settlement authority remains with a named claims specialist.",
    measure: "19m",
    measureLabel: "time to ownership",
  },
  finance: {
    code: "FIN–0931",
    label: "Finance controls",
    sector: "Accounting · group finance",
    accent: "green",
    subject: "Regional month-end close",
    subtitle: "August 2026 · Southern Africa",
    owner: "Thandi P.",
    due: "Day 3 · 12:00",
    progress: "84%",
    stage: "Controller review",
    stages: ["Collect", "Reconcile", "Explain", "Review", "Publish"],
    activeStage: 3,
    facts: [["Entities", "8 consolidated"], ["Accounts", "146 reconciled"], ["Variances", "2 open"], ["Source", "Controlled ledgers"]],
    evidence: [
      { name: "Balance reconciliations", meta: "146 signed", state: "ready" },
      { name: "Intercompany variance", meta: "R42 600 open", state: "review" },
      { name: "Executive commentary", meta: "Draft assembled", state: "waiting" },
    ],
    activity: ["Eight source ledgers locked", "Reconciliations tested against tolerance", "Two material variances routed to owners"],
    control: "The controller signs the explanation—not just the final number.",
    measure: "2.8d",
    measureLabel: "forecast close",
  },
  quality: {
    code: "CX–4418",
    label: "Service quality",
    sector: "Contact centres · customer operations",
    accent: "amber",
    subject: "Interaction quality review",
    subtitle: "Retention team · voice channel",
    owner: "Michael S.",
    due: "Today · 14:10",
    progress: "66%",
    stage: "Coaching action",
    stages: ["Capture", "Score", "Diagnose", "Coach", "Confirm"],
    activeStage: 3,
    facts: [["Interaction", "18m 42s"], ["Score", "81 / 100"], ["Cause", "Knowledge gap"], ["Source", "Recorded call"]],
    evidence: [
      { name: "Transcript and recording", meta: "Source linked", state: "ready" },
      { name: "Quality scorecard", meta: "12 controls tested", state: "ready" },
      { name: "Coaching acknowledgement", meta: "Awaiting agent", state: "waiting" },
    ],
    activity: ["Interaction selected by quality rule", "Scorecard pre-populated with evidence", "Coaching action assigned to team lead"],
    control: "A person owns the coaching conversation and confirms the outcome.",
    measure: "96%",
    measureLabel: "reviews on time",
  },
} as const;

type WorkspaceKey = keyof typeof workspaces;

export default function ServiceOperationsOS() {
  const [active, setActive] = useState<WorkspaceKey>("onboarding");
  const workspace = workspaces[active];

  return (
    <figure className="sv-os" data-accent={workspace.accent} aria-label="Interactive illustrative service operations system">
      <header className="sv-topbar">
        <span className="sv-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>SERVICE OPERATIONS OS · CONTROLLED WORKSPACE</span>
        <span className="sv-live"><i /> SYSTEM AVAILABLE</span>
      </header>

      <div className="sv-body">
        <aside className="sv-nav">
          <div className="sv-brand"><b>2K</b><span>Service<br />systems</span></div>
          <p>WORKSPACES</p>
          <nav aria-label="Choose a service system example">
            {(Object.keys(workspaces) as WorkspaceKey[]).map((key, index) => {
              const item = workspaces[key];
              return (
                <button key={key} type="button" data-active={active === key} onClick={() => setActive(key)}>
                  <i>0{index + 1}</i><span><strong>{item.label}</strong><small>{item.sector}</small></span><b>→</b>
                </button>
              );
            })}
          </nav>
          <div className="sv-nav-foot"><i /> All controls operational<small>Evidence sync · now</small></div>
        </aside>

        <main className="sv-workspace">
          <header className="sv-record-head">
            <div><span>ACTIVE RECORD · {workspace.code}</span><h3>{workspace.subject}</h3><p>{workspace.subtitle}</p></div>
            <div className="sv-owner"><span>OWNER</span><p><i>{workspace.owner.split(" ").map((part) => part[0]).join("")}</i>{workspace.owner}</p></div>
            <div className="sv-due"><span>NEXT CONTROL</span><strong>{workspace.due}</strong></div>
          </header>

          <section className="sv-progress" aria-label={`${workspace.progress} complete, currently at ${workspace.stage}`}>
            <div><span>CONTROLLED JOURNEY</span><strong>{workspace.progress}</strong></div>
            <ol>
              {workspace.stages.map((stage, index) => (
                <li key={stage} data-state={index < workspace.activeStage ? "done" : index === workspace.activeStage ? "active" : "next"}>
                  <i>{index < workspace.activeStage ? "✓" : `0${index + 1}`}</i><span>{stage}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="sv-canvas">
            <section className="sv-record">
              <header><span>ONE CONTROLLED RECORD</span><strong>{workspace.stage}</strong></header>
              <dl>
                {workspace.facts.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}
              </dl>
              <div className="sv-record-map" aria-hidden="true">
                <span className="sv-core"><i />{workspace.code}<small>PRIMARY RECORD</small></span>
                <span><i />PERSON</span><span><i />SOURCE</span><span><i />DECISION</span><span><i />OUTCOME</span>
              </div>
            </section>

            <section className="sv-evidence">
              <header><span>EVIDENCE PACK</span><b>{workspace.evidence.filter((item) => item.state === "ready").length}/{workspace.evidence.length} CONTROLLED</b></header>
              <ul>
                {workspace.evidence.map((item, index) => (
                  <li key={item.name} data-state={item.state}>
                    <i>{item.state === "ready" ? "✓" : item.state === "review" ? "!" : "·"}</i>
                    <div><strong>{item.name}</strong><small>{item.meta}</small></div><span>0{index + 1}</span>
                  </li>
                ))}
              </ul>
              <button type="button">Open complete evidence <span>↗</span></button>
            </section>
          </div>
        </main>

        <aside className="sv-control">
          <header><span>CONTROL RAIL</span><i /> LIVE</header>
          <div className="sv-measure"><span>FLOW MEASURE</span><strong>{workspace.measure}</strong><small>{workspace.measureLabel}</small></div>
          <section>
            <span>RECENT ACTIVITY</span>
            <ol>{workspace.activity.map((item, index) => <li key={item}><i>{index === workspace.activity.length - 1 ? "NOW" : `0${index + 1}`}</i><p>{item}</p></li>)}</ol>
          </section>
          <div className="sv-boundary"><span>HUMAN CONTROL</span><p>{workspace.control}</p><small><i /> Ownership remains visible</small></div>
          <button type="button">Open next action <span>→</span></button>
        </aside>
      </div>

      <figcaption><span>ILLUSTRATIVE INTERFACE · SYNTHETIC RECORDS</span><span>ONE RECORD · NAMED OWNER · VISIBLE EVIDENCE · MEASURABLE FLOW</span></figcaption>
    </figure>
  );
}
