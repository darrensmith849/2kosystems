"use client";

import { useState } from "react";

const routes = {
  unclear: {
    code: "DIAG–01",
    label: "Unclear process",
    signal: "The symptom is visible. The constraint is not.",
    sector: "Any operating environment",
    route: "Half-Day Process Review",
    commercial: "R7,500 · credited forward",
    owner: "Process lead",
    response: "Qualify within 1 business day",
    next: "Agree one live process, participants and explicit exclusions.",
    outcome: "A 3–4 page decision memo naming the smallest responsible next step.",
    gates: ["pass", "pass", "needs", "pass", "needs", "pass"],
    facts: [["Problem", "Symptoms known"], ["Scope", "One process"], ["Evidence", "Incomplete"], ["Sponsor", "Process owner"]],
  },
  evidence: {
    code: "AUD–02",
    label: "Evidence required",
    signal: "The decision spans processes, sites or material investment.",
    sector: "Multi-site · multi-process",
    route: "Opportunity Audit",
    commercial: "R24,500 · R48,000 extended",
    owner: "Improvement lead",
    response: "Executive fit conversation",
    next: "Bound the decision, sources, sites and value hypothesis.",
    outcome: "Quantified opportunities, priority order and one recommended intervention.",
    gates: ["pass", "pass", "needs", "pass", "needs", "pass"],
    facts: [["Problem", "Broadly known"], ["Scope", "Several flows"], ["Evidence", "Needs baseline"], ["Sponsor", "Executive"]],
  },
  automation: {
    code: "AUT–03",
    label: "Automation opportunity",
    signal: "Repeatable work is creating delay, re-entry or avoidable control risk.",
    sector: "Operations · finance · service",
    route: "Automation qualification",
    commercial: "Pilot from R145,000",
    owner: "Automation lead",
    response: "Rules and exception review",
    next: "Test stability, volume, human boundaries and annual value.",
    outcome: "A bounded pilot with a baseline, exception route and measured answer.",
    gates: ["pass", "pass", "conditional", "pass", "needs", "pass"],
    facts: [["Problem", "Repetition"], ["Scope", "One workflow"], ["Evidence", "Volume known"], ["Sponsor", "Operating owner"]],
  },
  system: {
    code: "SYS–04",
    label: "System requirement",
    signal: "A defined process needs one controlled operating record.",
    sector: "Field · service operations",
    route: "Product validation / discovery",
    commercial: "Fixed product or phased build",
    owner: "Systems lead",
    response: "Scope boundary validation",
    next: "Confirm users, roles, data, integrations and control requirements.",
    outcome: "Direct product scope where fit is exact; paid discovery where it is not.",
    gates: ["pass", "pass", "pass", "pass", "conditional", "pass"],
    facts: [["Problem", "Defined"], ["Scope", "Product or custom"], ["Evidence", "Process agreed"], ["Sponsor", "System owner"]],
  },
  training: {
    code: "CAP–05",
    label: "Training & capability",
    signal: "The operating result depends on capability, application and reinforcement.",
    sector: "Six Sigma · enterprise learning",
    route: "Capability scoping",
    commercial: "Cohort or organisational proposal",
    owner: "Training lead",
    response: "Population and outcome review",
    next: "Confirm belt, cohort, delivery mode, certification and workplace application.",
    outcome: "A training plan connected to assessment, projects and Sigmafy where useful.",
    gates: ["pass", "pass", "conditional", "pass", "pass", "pass"],
    facts: [["Problem", "Capability gap"], ["Scope", "Cohort / rollout"], ["Evidence", "Application defined"], ["Sponsor", "Learning + operations"]],
  },
  sigmafy: {
    code: "SIG–06",
    label: "Sigmafy",
    signal: "The team needs a learning platform, statistical tools or both.",
    sector: "Learning · analysis · projects",
    route: "Product demonstration",
    commercial: "Licence / pilot / bundle",
    owner: "Product lead",
    response: "Use-case demonstration",
    next: "Confirm users, permissions, data boundaries and support needs.",
    outcome: "The smallest subscription or pilot that proves adoption and utility.",
    gates: ["pass", "pass", "pass", "pass", "conditional", "pass"],
    facts: [["Problem", "Tooling need"], ["Scope", "Users + modules"], ["Evidence", "Use case known"], ["Sponsor", "Product owner"]],
  },
  partnership: {
    code: "PAR–07",
    label: "Improvement partnership",
    signal: "Several connected workstreams need sustained capacity and governance.",
    sector: "Enterprise transformation",
    route: "Executive qualification",
    commercial: "Paid mobilisation → annual retainer",
    owner: "2KO principal",
    response: "Sponsor-led fit conversation",
    next: "Validate sponsorship, portfolio, training population, data and decision window.",
    outcome: "A 90-day mobilisation plan and annual operating cadence.",
    gates: ["pass", "needs", "needs", "pass", "pass", "needs"],
    facts: [["Problem", "Portfolio"], ["Scope", "Several workstreams"], ["Evidence", "Mixed readiness"], ["Sponsor", "Executive required"]],
  },
  stop: {
    code: "STOP–08",
    label: "No responsible engagement",
    signal: "There is no owner, decision path, proportionate value or credible 2KO fit.",
    sector: "Protect the client and 2KO",
    route: "Decline / refer / revisit",
    commercial: "No proposal manufactured",
    owner: "Enquiry owner",
    response: "Clear, useful close-out",
    next: "Record the reason and provide a referral or readiness condition where possible.",
    outcome: "A clean decision rather than an open lead consuming delivery capacity.",
    gates: ["needs", "needs", "conditional", "needs", "needs", "needs"],
    facts: [["Problem", "Unclear / weak"], ["Scope", "Not bounded"], ["Evidence", "Insufficient"], ["Sponsor", "Not present"]],
  },
} as const;

type RouteKey = keyof typeof routes;
const gateNames = ["Problem", "Ownership", "Evidence", "2KO fit", "Value", "Commitment"];

export default function EnquiryRoutingMatrix() {
  const [active, setActive] = useState<RouteKey>("unclear");
  const route = routes[active];

  return (
    <figure className="er-console" data-route={active} aria-label="Interactive internal 2KO enquiry routing matrix">
      <header className="er-topbar">
        <span className="er-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>2KO ENQUIRY OPERATING SYSTEM · ROUTING MATRIX</span>
        <span className="er-internal"><i /> INTERNAL PROTOTYPE</span>
      </header>

      <nav className="er-route-tabs" aria-label="Select an enquiry pattern">
        {(Object.keys(routes) as RouteKey[]).map((key, index) => (
          <button key={key} type="button" data-active={active === key} onClick={() => setActive(key)}>
            <i>0{index + 1}</i><span>{routes[key].label}</span><b>→</b>
          </button>
        ))}
      </nav>

      <div className="er-workspace">
        <aside className="er-signal">
          <span>ENQUIRY SIGNAL · {route.code}</span>
          <h3>{route.label}</h3>
          <p>{route.signal}</p>
          <dl>{route.facts.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
          <div className="er-owner"><i /> Assigned to <strong>{route.owner}</strong></div>
        </aside>

        <main className="er-gates">
          <header><div><span>QUALIFICATION CONTROL</span><h3>Six gates before a proposal</h3></div><small>DEFAULT ROUTE · HUMAN OVERRIDE ALLOWED</small></header>
          <ol>
            {gateNames.map((name, index) => {
              const state = route.gates[index];
              return (
                <li key={name} data-state={state}>
                  <span>0{index + 1}</span><i>{state === "pass" ? "✓" : state === "needs" ? "!" : "~"}</i>
                  <div><strong>{name}</strong><small>{state === "pass" ? "Sufficient to route" : state === "needs" ? "Must be established" : "Validate in scope"}</small></div>
                </li>
              );
            })}
          </ol>
          <div className="er-rule"><span>OVERRIDE RULE</span><p>The default may be changed when the enquiry owner records the evidence and reason.</p></div>
        </main>

        <aside className="er-decision">
          <span>ROUTE DECISION</span>
          <div className="er-route-mark" aria-hidden="true"><i /><i /><b>↳</b></div>
          <h3>{route.route}</h3>
          <p>{route.commercial}</p>
          <dl><div><dt>Response</dt><dd>{route.response}</dd></div><div><dt>Next controlled action</dt><dd>{route.next}</dd></div><div><dt>Decision artefact</dt><dd>{route.outcome}</dd></div></dl>
          <button type="button">Create routed opportunity <span>→</span></button>
        </aside>
      </div>

      <section className="er-matrix" aria-label="All enquiry routes at a glance">
        <header><span>ALL PATHWAYS</span><span>DEFAULT COMMERCIAL ENTRY</span><span>PRIMARY OWNER</span><span>STATE</span></header>
        {(Object.keys(routes) as RouteKey[]).map((key) => {
          const item = routes[key];
          return (
            <button key={key} type="button" data-active={active === key} onClick={() => setActive(key)}>
              <span><i />{item.label}</span><span>{item.commercial}</span><span>{item.owner}</span><b>{active === key ? "SELECTED" : "VIEW"}</b>
            </button>
          );
        })}
      </section>

      <figcaption><span>OPERATING PROTOTYPE · NOT A CRM OR CONTRACTUAL WORKFLOW</span><span>DEFAULT ROUTE + RECORDED HUMAN OVERRIDE</span></figcaption>
    </figure>
  );
}
