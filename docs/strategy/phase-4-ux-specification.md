# 2KO Systems — Phase 4 UX Specification

Status: Approval specification; no product code changed  
Date: 12 September 2026

## 1. UX objective

A qualified visitor should understand within one screen that 2KO:

1. improves operational processes;
2. does not assume software is always the answer;
3. can train, automate and systemise through the appropriate group capability;
4. measures the result;
5. can remain accountable after launch.

The primary journey begins with a process problem rather than a requested technology.

## 2. Desktop navigation

```text
2KO Systems   Services⌄   Method   Results   Sectors   Pricing   About   [Bring us the process]
```

Services menu:

```text
Diagnose
  Process Review                    R7,500
  Process & Automation Audit       R24,500

Build
  Systems & Automation
  Workflow Automation Pilot       from R145,000
  Fixed-scope operational systems

Improve
  Managed Improvement
  Train, Improve & Embed
```

Websites move to the footer under **Other 2KO services**.

## 3. Mobile navigation

```text
2KO Systems                                 [Menu]

When open:
Services
  Process Review
  Process & Automation Audit
  Systems & Automation
  Managed Improvement
Method
Results
Sectors
Pricing
About
[Bring us the process]

Other 2KO services
  Websites
  Six Sigma South Africa ↗
  Sigmafy ↗
```

Requirements:

- one-column menu;
- visible close control;
- native keyboard and focus behavior;
- no hover dependency;
- no price-heavy product catalogue at the first level;
- CTA visible without requiring the visitor to understand the service taxonomy.

## 4. Homepage low-fidelity structure

```text
┌──────────────────────────────────────────────────────────────┐
│ Navigation                         [Bring us the process]     │
├──────────────────────────────────────────────────────────────┤
│ PROCESS IMPROVEMENT · AUTOMATION · SOUTH AFRICA              │
│                                                              │
│ Improve the process.                                         │
│ Automate what should never fail.                             │
│                                                              │
│ Explanation of process, training and technology choices.     │
│ [Bring us the process]  [See how improvement works]          │
│                                                              │
│ R7,500 review · 4–6 week pilot · fixed scope · code yours    │
├──────────────────────────────────────────────────────────────┤
│ WHERE IT BREAKS                                              │
│ Six recognisable operational symptoms                        │
├──────────────────────────────────────────────────────────────┤
│ THE RIGHT INTERVENTION                                       │
│ Improve process · Equip people · Automate · Systemise        │
├──────────────────────────────────────────────────────────────┤
│ HOW IMPROVEMENT HOLDS                                        │
│ Diagnose → Measure → Improve → Train → Automate → Sustain    │
├──────────────────────────────────────────────────────────────┤
│ THE CONTROL IN OPERATION                                     │
│ Existing interactive demo, reframed around a process rule    │
├──────────────────────────────────────────────────────────────┤
│ SYSTEMS AND AUTOMATION                                       │
│ Rules-based · Intelligence-assisted · Operational systems    │
├──────────────────────────────────────────────────────────────┤
│ RESULTS ON RECORD                                            │
│ Up to three verified cases or an honest pre-proof state      │
├──────────────────────────────────────────────────────────────┤
│ AFTER GO-LIVE                                                │
│ Care · Managed Improvement · CI Partner                      │
├──────────────────────────────────────────────────────────────┤
│ WHERE TO START                                               │
│ Review · Audit · Pilot · Build · Managed Improvement         │
├──────────────────────────────────────────────────────────────┤
│ ONE GROUP                                                    │
│ Train · Improve · Systemise · Sustain                        │
├──────────────────────────────────────────────────────────────┤
│ Bring us the process that keeps going wrong.                 │
│ [Bring us the process]  [Find your starting point]           │
└──────────────────────────────────────────────────────────────┘
```

## 5. Homepage interaction behavior

### Hero

- retain a strong static first frame;
- do not require animation to reveal the core promise or CTA;
- use motion to support the explanation, not delay it;
- preserve reduced-motion behavior;
- ensure the first proof statement is factual without interaction.

### Problem recognition

- six symptoms may use an ordered or progressive reveal;
- the complete text remains accessible without hover;
- each symptom routes to an appropriate diagnostic or service only when the destination adds value;
- do not make every card a competing CTA.

### Intervention selector

An optional compact interaction may allow visitors to select a symptom and see likely interventions. It must always say **likely**, never diagnose from one click.

Example:

```text
Symptom: Reports take days to assemble

Likely investigation:
Process map → data sources → repeated handling → reporting rule

Possible interventions:
Process simplification · rules-based automation · system integration
```

### Improvement lifecycle

- show the full sequence on first render;
- selection may reveal a concise stage explanation;
- do not hide stages in an auto-advancing carousel;
- provide a direct Method link.

### Interactive operational demo

- retain Approve/Decline interaction;
- introduce the failure and control before the interface;
- show which metric the control affects without inventing a result;
- keep the illustrative-data disclosure visible;
- prevent the pinned sequence from creating long apparently blank scroll periods;
- provide a static completed state for reduced motion and non-JavaScript contexts.

### Proof

- verified case cards show baseline, result, period and evidence label;
- illustration and case study use visually and verbally distinct labels;
- an empty proof state is preferable to invented performance;
- group logos are secondary to outcome evidence.

## 6. Starting-point journey

The current Scope Builder selects a product from technical scope. The revised journey first determines whether the buyer needs diagnosis, training, automation, a product, a pilot or a managed service.

### Step 1 — What is happening?

Question:

> Which statement is closest to the problem?

Options:

- Work waits for approval or ownership.
- Information is captured more than once.
- Reporting or reconciliation is assembled manually.
- Exceptions are discovered too late.
- A spreadsheet or manual register has outgrown the work.
- An earlier improvement is no longer holding.
- The system is live but the process needs to keep improving.
- Something else.

### Step 2 — Is the process agreed?

Question:

> Would the people involved describe the process the same way?

Options:

- Yes, the process and failure are well understood.
- Mostly, with some grey areas.
- No, each role would describe it differently.
- We do not know.

Routing effect:

- No/unknown strongly favours Process Review.
- Mostly may favour Review or Audit.
- Yes allows product or pilot qualification.

### Step 3 — What is the likely constraint?

Question:

> Which of these is most visible today?

Options:

- Unclear ownership or unnecessary steps.
- People need stronger problem-solving or process capability.
- Repetitive handling, routing or checking.
- Disconnected tools or missing operational record.
- We cannot tell yet.

Routing effect:

- process → Review/Audit;
- capability → training route;
- repetition → Automation;
- disconnected tools → Product/Pilot;
- unknown → Review.

### Step 4 — How large is the scope?

Questions:

- one process, connected processes, or several workstreams;
- standalone or integrated;
- three or fewer roles, or a larger permission model;
- one site or multiple sites.

Routing effect:

- bounded and standard may fit a product;
- one measurable non-standard process may fit a Pilot;
- multiple processes/sites should require Audit or phased scoping.

### Step 5 — Is there evidence?

Question:

> Is there a reliable baseline or transaction history?

Options:

- Yes, it is available.
- Some information exists but needs work.
- No baseline exists.

Ask optional non-sensitive ranges:

- frequency;
- affected people;
- rough annual value band;
- consequence category: time, cost, quality, compliance, safety, customer.

Do not request operational records through the public flow.

### Step 6 — Result

Possible results:

- Half-Day Process Review;
- Process and Automation Opportunity Audit;
- training conversation with Six Sigma South Africa;
- fixed-scope operational product;
- Workflow Automation Pilot;
- Managed Improvement qualification;
- Fit Call where the information remains insufficient;
- no-build or off-the-shelf consideration.

Each result must show:

- why the path was selected using the visitor's answers;
- published price where approved;
- timebox where approved;
- boundaries;
- one primary next action;
- alternative lower-commitment path where useful.

### Step 7 — Contact handoff

Collect:

- first and last name;
- work email;
- company;
- phone, optional;
- site or region;
- short process description;
- explicit consent to be contacted about the enquiry.

Automatically include:

- question answers;
- recommended path;
- source page;
- campaign attribution;
- first landing page;
- timestamp.

Display the data warning before free-text entry.

## 7. Form response behavior

### Success

> Thank you. Your process brief has landed. We will review it and respond within one business day with the appropriate next step. If the right answer is that nothing should be built, we will say so.

### Validation

- identify the specific missing or invalid field;
- preserve all entered values;
- do not clear the journey after an error;
- put focus on the first invalid field;
- announce errors accessibly.

### Failure

- provide a retry action;
- offer the published email and phone route;
- do not claim the enquiry was received;
- preserve the generated brief locally in the page until the visitor leaves.

## 8. Proof states

### Verified case study

Must display:

- named or anonymised client status;
- process;
- baseline;
- result;
- measurement period;
- evidence classification;
- client permission status internally.

### Measured internal case

Label:

> 2KO Group operating case

Do not present the group as an external client.

### Illustrative demonstration

Label:

> Illustrative workflow. Records and values are invented to show the mechanism.

### Proof unavailable

Use method, scope and ownership evidence. Do not replace the gap with an invented number.

## 9. Responsive and accessibility requirements

- core promise and CTA visible without horizontal scrolling at 320px;
- navigation usable by keyboard and touch;
- no hover-only information;
- minimum target size appropriate for touch;
- heading hierarchy remains logical when sections stack;
- pricing tables become stacked comparisons or controlled horizontal tables;
- proof labels remain adjacent to the figure they qualify;
- animations respect reduced-motion preferences;
- non-JavaScript content remains visible;
- forms expose programmatic labels, instructions and error messages;
- interactive demo has a textual alternative;
- colour is never the only indicator of status;
- focus remains visible;
- external group links are identified.

## 10. Content governance

Every strategic page requires an owner and review date.

| Page type | Owner | Review trigger |
| --- | --- | --- |
| Pricing | Commercial owner | Any cost, scope or term change |
| Retainers | Delivery and commercial owners | Quarterly or after three pilot clients |
| Results | Evidence owner and client approver | New measurement or wording change |
| Automation | Technical and process owners | Capability or governance change |
| Method | Process-improvement lead | Delivery-model change |
| Legal and ownership | Company/legal owner | Contract or regulatory change |

No client claim may be changed without retaining the underlying evidence and approval record.

