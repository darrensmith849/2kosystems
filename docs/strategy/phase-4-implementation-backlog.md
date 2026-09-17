# 2KO Systems — Phase 4 Implementation Backlog

Status: Code-ready backlog; implementation has not started  
Date: 12 September 2026

## 1. Release strategy

Deliver the repositioning in three controlled releases rather than replacing the entire site at once.

### Release A — Position and route

Goal: make process optimisation unmistakable and correct the primary buyer journey.

Includes:

- navigation;
- homepage message hierarchy;
- Process Review page;
- Process and Automation Audit page;
- Systems page relabelled and reframed;
- contact CTA and form language;
- Websites moved to secondary navigation;
- baseline analytics and conversion events.

### Release B — Expand the commercial offer

Goal: launch automation and managed improvement after pricing approval.

Includes:

- Automation page;
- Managed Improvement page;
- revised pricing architecture;
- revised starting-point journey;
- retainer lead routing;
- service and FAQ structured data where appropriate.

### Release C — Prove and optimise

Goal: add verified evidence and improve conversion from measured behavior.

Includes:

- Results index;
- Sigmafy internal operating case;
- first verified client case studies;
- case-study filters only when enough cases exist;
- experiment roadmap;
- post-launch iteration.

## 2. Global work

### P0 — Navigation and information architecture

- replace the first-level Websites and Systems arrangement with Services;
- add Method, Results, Sectors, Pricing and About;
- change primary CTA to Bring us the process;
- move Websites to secondary/footer navigation;
- retain stable product and website URLs;
- implement accessible mobile menu behavior;
- ensure active states work for parent and child routes.

**Acceptance:** A new visitor can reach Process Review, Audit, Systems and Automation, Managed Improvement, Results and Pricing from the global navigation. Websites remain reachable without appearing as an equal operational division.

### P0 — Metadata and structured data

- update root title and description around process improvement and automation;
- add process optimisation and managed improvement subject matter;
- remove unsupported or overly narrow metadata where appropriate;
- update Organisation and ProfessionalService descriptions;
- add approved services to the offer catalogue;
- ensure canonical URLs remain correct;
- update sitemap routes and review date;
- do not add AggregateRating or unsupported performance schema.

**Acceptance:** Every strategic page has a unique title, description and canonical URL aligned to its buyer intent.

### P0 — Analytics foundation

- preserve existing paid-search conversion calls;
- introduce a typed general event layer compatible with GA4 or PostHog;
- capture source page, CTA, offer, first landing page and campaign attribution;
- distinguish anonymous journey completion from submitted enquiry;
- record service interest without treating it as a conversion;
- test events in development and production diagnostics;
- document event ownership.

**Acceptance:** A successful enquiry is the primary conversion. CTA clicks and form starts are diagnostic events rather than primary advertising conversions.

## 3. Homepage work

### P0 — Hero

- replace the system-first headline with the approved process-optimisation message;
- introduce process, training and technology as conditional interventions;
- retain fixed-price and ownership proof;
- change CTA labels;
- remove invented performance values from proof positions;
- keep first content visible with JavaScript disabled and reduced motion enabled.

### P0 — Problem recognition

- add six approved operational symptoms;
- keep the content readable without interaction;
- avoid turning every symptom into an independent conversion action.

### P0 — Intervention and lifecycle

- add Improve, Equip, Automate and Systemise decision model;
- add Diagnose through Sustain lifecycle;
- cross-link training and Sigmafy only where relevant;
- state that do-not-build is a valid outcome.

### P1 — Interactive demo reframing

- retain the existing operational console;
- add before-state and process-control explanation;
- connect actions to a metric definition rather than an invented result;
- strengthen illustrative-data disclosure;
- reduce pinned empty-scroll behavior;
- provide a static reduced-motion state.

### P1 — Managed improvement preview

- add Care, Managed Improvement and CI Partner comparison;
- hide unapproved proposed prices behind approved wording until sign-off;
- link to the full Managed Improvement page.

### P1 — Proof section

- implement an honest empty/pre-proof state;
- relabel group logos accurately;
- support later insertion of verified case cards without homepage redesign;
- never render illustrative group outcomes as client results.

## 4. New pages

### P0 — `/process-review`

- implement approved copy;
- show scope, method, outcomes, price and credit terms;
- provide sample deliverable structure;
- route CTA with Process Review context;
- add Service structured data only with approved facts.

### P0 — `/audit`

- implement approved copy;
- show standard and extended scope;
- explain observed versus reported evidence;
- show example finding and benefit calculation without a client claim;
- link the existing audit template where appropriate;
- route CTA with Audit context.

### P1 — `/automation`

- implement approved copy;
- separate rules-based and intelligence-assisted automation;
- show when not to automate;
- document the human-decision boundary;
- route to Pilot or Review based on process clarity.

### P1 — `/managed-improvement`

- implement only after pricing and capacity approval;
- show monthly operating cadence;
- compare Care, Managed Improvement and CI Partner;
- make boundaries and exclusions as visible as inclusions;
- include ownership and exit terms;
- capture retainer-specific interest.

### P2 — `/results`

- implement the Results index before adding client cases;
- publish only verified cases;
- support measured internal cases and anonymised cases distinctly;
- add filters only after enough cases exist to make them useful.

## 5. Existing page revisions

### P0 — `/systems`

- relabel as Systems and Automation;
- replace “built around how your operation already runs” with language that includes process improvement before automation;
- connect six system layers to process outcomes;
- add automation categories and human-decision boundary;
- separate productised systems from custom pilots;
- add Managed Improvement continuation.

### P0 — `/method`

- extend the visible lifecycle to include diagnosis, training, automation and sustain;
- retain DMAIC credibility;
- distinguish the client improvement lifecycle from the delivery phases;
- connect each stage to an offer and decision gate;
- retain the ability to stop after any phase.

### P0 — `/contact`

- change heading and CTA language to Bring us the process;
- add structured process questions or link into the starting-point flow;
- replace Website field with Site or region for the operational journey;
- add sensitive-data warning;
- preserve attribution;
- update success response.

### P1 — `/quote`

- relabel as Find your starting point;
- replace the technology-first resolver with intervention-neutral logic;
- add Process Review, Audit, Training, Automation, Product, Pilot and Managed Improvement outcomes;
- keep deterministic published pricing;
- preserve all answers through contact handoff;
- add accessible progress and validation;
- maintain server-side result resolution.

### P1 — `/pricing`

- separate diagnostic, implementation and managed sections;
- remove website packages from the operational ladder;
- retain published fixed-scope products;
- publish managed-tier prices only after sign-off;
- explain outcome partnerships without implying universal eligibility;
- revise annual prepayment terms when approved.

### P1 — `/studio`

- relabel navigation as About;
- lead with process-improvement heritage;
- explain group roles;
- retain boundaries and no-lock-in principles;
- remove or qualify unsupported uptime or scale claims;
- consider later redirect to `/about`.

### P1 — `/sectors`

- add buyer-recognised measures to each sector;
- distinguish physical-process work from information control;
- connect each sector to Review, Audit or relevant product;
- reserve result slots for verified cases.

### P1 — product pages

- change expected-outcome language where it reads as a guaranteed result;
- add baseline and post-launch measurement requirement;
- add Managed Improvement continuation;
- preserve existing product scope and search intent.

### P2 — website pages

- remove links that pull operational buyers into the website journey;
- retain search, advertising, pricing and conversion capability;
- add a clear label that this is a separate 2KO service;
- measure the service independently.

## 6. Starting-point resolver work

### P0 — Domain model

Introduce outcomes for:

- Fit Call;
- Process Review;
- Opportunity Audit;
- Training route;
- Fixed-scope product;
- Workflow Automation Pilot;
- Managed Improvement qualification;
- no-build/off-the-shelf consideration.

### P0 — Rules

- disputed process routes to Review;
- insufficient evidence may route to Audit;
- capability-led constraint routes to training;
- bounded standard scope may route to a product;
- bounded non-standard workflow may route to Pilot;
- live system requiring recurring improvement may route to Managed Improvement;
- multi-process or multi-site uncertainty routes to Audit;
- consequential decision automation requires human-governance review.

### P0 — Safety and privacy

- do not collect uploaded files initially;
- warn against confidential, personal, credential, medical and regulated information;
- validate and limit free-text length;
- retain honeypot and server-side validation;
- log no sensitive form body in analytics;
- add rate limiting if not already present;
- verify lead destination permissions.

### P0 — Result handoff

- generate a concise process brief;
- include reasons for the recommendation;
- show approved price and timebox only;
- carry the brief into the contact submission;
- send the same result to the user and internal lead destination;
- preserve attribution.

## 7. Proof implementation

### P0 — Claims register

- maintain a structured source for every public numeric or client claim;
- record claim, source, owner, verification date, expiry/review date and permitted wording;
- fail content review when evidence is missing.

### P1 — Logo attribution

- replace “software ecosystem” with “organisations served across the 2KO Group” if verified;
- confirm logo-use permissions and group relationship;
- do not imply a Systems implementation.

### P1 — Demo disclosure

- create one reusable Illustrative disclosure component;
- place it adjacent to every invented workflow or number;
- avoid displaying illustrative values in proof-oriented cards.

### P2 — Case-study model

Fields:

- slug;
- title;
- client naming status;
- sector;
- process;
- intervention types;
- baseline;
- result;
- measurement period;
- sustained period;
- evidence type;
- evidence note;
- permissions status, internal only;
- CTA context.

## 8. Testing requirements

### Content

- no INTERNAL instructions render;
- no proposed price renders before approval;
- no illustrative figure appears as a client result;
- all group claims use group attribution;
- all prices agree with the single pricing source.

### Functional

- navigation and menus;
- starting-point outcomes;
- contact submission;
- attribution preservation;
- email and lead routing;
- conversion tracking;
- reduced motion;
- non-JavaScript visibility;
- error and retry paths.

### Responsive

- 320, 390, 768, 1024 and 1440 CSS-pixel widths;
- mobile menu;
- pricing comparison;
- long headings and CTA wrapping;
- interactive demo fallback;
- form progression and errors.

### Accessibility

- keyboard-only journey;
- screen-reader labels and status announcements;
- heading order;
- focus management;
- contrast;
- touch targets;
- external-link identification;
- no information conveyed by colour alone.

### Search and sharing

- canonical URLs;
- sitemap;
- robots behavior;
- Open Graph and social images;
- structured-data validation;
- redirect checks;
- page titles and descriptions.

## 9. Launch gates

Release A may launch only when:

- strategy copy is approved;
- company and group claims are verified or omitted;
- navigation and contact paths are tested;
- current conversion baseline is recorded;
- analytics events are verified;
- website-service traffic remains reachable through its intended paths.

Release B may launch only when:

- managed-tier scope and pricing are approved;
- at least two pilot clients are identified;
- capacity ownership is assigned;
- commercial terms are updated;
- lead handling and qualification are ready.

Release C may launch only when:

- every case has a complete evidence pack;
- client wording permission is recorded;
- result calculations are independently checked;
- the published evidence note is approved.

## 10. Definition of complete

The repositioning is complete when:

- a five-second test identifies 2KO as a process-improvement and automation partner;
- visitors can enter through a process problem without selecting technology;
- training, automation and systemisation are shown as conditional interventions;
- managed improvement has a credible commercial and delivery model;
- proof is clearly separated from illustration;
- pricing remains transparent;
- Websites no longer defines the operational buyer journey;
- conversion and commercial outcomes can be measured from baseline.

