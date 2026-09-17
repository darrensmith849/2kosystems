# 2KO Systems — Retainer Operating Playbook

Status: Systems-only operating baseline; the approved umbrella partnerships are defined in `integrated-partnership-commercial-model.md`  
Date: 12 September 2026

## 1. Purpose

This playbook defines the original Systems-only Care, Managed Improvement and Continuous Improvement Partner operating model without turning it into unlimited support or discounted development. The group-level offer now combines training, consulting, automation and Sigmafy under the higher-value Integrated Improvement Partnership architecture in `integrated-partnership-commercial-model.md`. Where the two documents conflict, the integrated commercial model governs the umbrella offer.

## 2. Common rules

Every retainer requires:

- a signed schedule naming the system or workstream;
- a client sponsor and day-to-day owner;
- named 2KO accountable lead;
- stated service hours and response commitments;
- an agreed backlog and change-approval method;
- separation of incidents, defects, service requests and improvements;
- documented third-party services and pass-through costs;
- a monthly service record;
- a quarterly decision on whether the retainer remains the right tier.

Retainers do not transfer line-management accountability or statutory responsibility to 2KO.

## 3. Work classification

| Type | Definition | Treatment |
| --- | --- | --- |
| Incident | Live service is unavailable or materially degraded | Managed under the support SLA |
| Defect | Accepted functionality does not behave as documented | Corrective maintenance when reproducible |
| Service request | Access, configuration or routine operational request | Scheduled within tier capacity |
| Improvement | Change intended to improve a process metric, control or user outcome | Prioritised through the improvement backlog |
| Project | New process, major integration, migration or material architecture change | Separately scoped and priced |

Calling project work an improvement does not place it inside the retainer.

## 4. Service hours and severity

Standard service hours are proposed as 08:00–17:00 South African time on business days, excluding public holidays. Any after-hours or 24/7 requirement requires a separately costed support schedule and on-call capacity.

| Severity | Definition | Care response | Managed Improvement response | CI Partner response |
| --- | --- | --- | --- | --- |
| P1 | Production unavailable or critical operational transaction blocked for most users | Next business day | Same business day | Within 4 business hours |
| P2 | Material degradation with a viable workaround | Next business day | Same business day | Same business day |
| P3 | Limited defect or non-critical service request | Within 2 business days | Within 1 business day | Within 1 business day |
| P4 | Planned improvement or enhancement | Out of scope | Prioritised monthly | Prioritised fortnightly |

These are initial-response targets, not guaranteed restoration times. Restoration commitments may be added only when the system architecture, dependencies and on-call capacity support them.

## 5. Account onboarding

### Care onboarding

- confirm production architecture and service ownership;
- confirm monitoring and alert destinations;
- test backup and restore procedure;
- record third-party dependencies;
- record access and escalation contacts;
- establish open-defect baseline;
- issue service schedule.

### Managed Improvement onboarding

Complete Care onboarding, then:

- name the process and workflow;
- agree the principal outcome and control metrics;
- establish baseline period;
- confirm event and data sources;
- name process and system owners;
- create the initial improvement backlog;
- schedule monthly and quarterly reviews.

### Continuous Improvement Partner onboarding

Complete Managed Improvement onboarding, then:

- define the complete workstream boundary;
- document current-state and target-state measures;
- agree governance and decision rights;
- establish benefits register;
- identify training and change dependencies;
- agree roadmap themes and first-quarter priorities;
- schedule fortnightly, monthly and quarterly forums.

## 6. Managed improvement cycle

### Week 1 — Measure

- refresh scorecard;
- review data quality;
- identify exceptions, drift and unmet targets;
- update benefit calculations.

### Week 2 — Analyse and select

- review the process with the client owner;
- identify the current constraint;
- classify the intervention as process, capability, system or combination;
- select one improvement within available capacity.

### Week 3 — Implement

- make the agreed process, configuration, automation or small software change;
- update operating guidance;
- provide targeted enablement where required;
- preserve approval and audit requirements.

### Week 4 — Verify and control

- confirm the change in production;
- review early performance;
- record result or learning;
- update backlog and control plan;
- issue monthly service record.

The exact dates may vary, but the sequence may not be replaced by an unprioritised queue of requests.

## 7. Meetings and artifacts

### Monthly operating review

Duration: 45–60 minutes.

Agenda:

1. metric movement;
2. exceptions and incidents;
3. previous improvement result;
4. current constraint;
5. next improvement decision;
6. client dependencies and risks.

Artifacts:

- scorecard;
- incident and exception summary;
- improvement backlog;
- decision log;
- capacity record;
- benefits register.

### Quarterly benefits review

Agenda:

1. baseline versus current performance;
2. benefit delivered and method of calculation;
3. observed, calculated and client-reported results;
4. adoption and control health;
5. work that did not produce the expected result;
6. next-quarter roadmap;
7. tier and capacity suitability.

## 8. Minimum scorecard

Every managed account should have a small scorecard rather than a generic dashboard.

| Metric type | Example |
| --- | --- |
| Outcome | Average approval cycle, jobs closed same day, exceptions resolved |
| Quality | Rework rate, rejected records, data completeness |
| Control | Overdue actions, bypassed approvals, unassigned work |
| Adoption | Active users, process volume through the system, offline workarounds |
| Reliability | Availability, failed jobs, integration errors |
| Capacity | Planned days used, carried and expired |

Use no more than eight recurring metrics unless the workstream genuinely requires more.

## 9. Backlog rules

Each item must include:

- problem statement;
- affected metric;
- evidence;
- expected mechanism of improvement;
- effort estimate;
- risk and dependency;
- client owner;
- acceptance criterion.

Prioritisation order:

1. safety, compliance and service restoration;
2. control failure;
3. high-value measurable constraint;
4. data quality and adoption;
5. convenience and cosmetic changes.

## 10. Capacity rules

### Capacity unit model

Use delivery-equivalent days for planning, including preparation, analysis, meetings, documentation, implementation and verification.

Initial planning load per account:

| Tier | Planned delivery | Governance and analysis | Support allowance | Total capacity units/month |
| --- | ---: | ---: | ---: | ---: |
| Care | — | 0.10 | 0.15 | 0.25 |
| Managed Improvement | 2.00 | 0.50 | 0.25 | 2.75 |
| CI Partner | 5.00 | 1.00 | 0.50 | 6.50 |

A senior accountable lead should be planned against no more than 14 client capacity units per month until actual data supports a higher figure. The remaining working time protects presales, internal work, leave, escalation and unplanned incident demand.

Examples:

- five Managed Improvement clients consume 13.75 units;
- two CI Partner clients consume 13.00 units;
- three Managed Improvement clients plus one CI Partner consume 14.75 units and should not be assigned to one lead without additional delivery support;
- Care accounts should be served by a pooled support function and monitored for actual incident consumption.

## 11. Capacity rollover

- only explicitly included planned delivery capacity may roll;
- capacity rolls for one month only;
- incident effort does not create replacement development capacity;
- client delays do not create an unlimited bank of days;
- work must still fit the retainer boundary when rolled;
- large accumulated items are converted into a separately scoped project.

## 12. Benefit calculation

Every claimed benefit must record:

- metric definition;
- baseline period;
- comparison period;
- volume;
- rate or unit value;
- assumptions;
- external contributors;
- confidence status: measured, estimated or indicative;
- client acceptance or disagreement.

Standard calculation patterns include:

```text
Avoided handling cost
= transactions × avoidable minutes × loaded cost per minute

Recovered value
= additional completed outcomes × verified unit contribution

Avoided rework
= reduction in rework events × average verified cost per event

Cycle-time improvement
= baseline elapsed time − current elapsed time
```

Benefits will not be double-counted across categories.

## 13. Training within retainers

Managed retainers may include small, non-accredited enablement connected directly to a process or system change, such as:

- revised work instruction walkthrough;
- supervisor briefing;
- short refresher session;
- onboarding material update;
- role-specific job aid.

Formal belt training, accredited assessment, substantial change programmes and large cohorts are routed to Six Sigma South Africa and separately contracted.

## 14. Exit and transition

At termination, 2KO will provide:

- current system and service documentation;
- current backlog and decision log;
- most recent scorecard and benefits register;
- access and dependency inventory;
- agreed data export;
- reasonable handover within the contracted capacity.

Termination does not remove the client's ownership of commissioned code, documentation or data.

## 15. Retainer health measures

2KO should monitor the retainer portfolio using:

- gross margin by tier;
- actual capacity consumed versus sold;
- incident rate per system;
- response-target attainment;
- improvement throughput;
- percentage of improvements with measurable results;
- quarterly review completion;
- client retention;
- build-to-retainer attachment rate;
- scope-overrun and project-conversion rate.

The first pricing review should occur after three months of live delivery or three active clients, whichever comes first.
