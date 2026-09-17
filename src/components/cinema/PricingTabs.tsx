"use client";

import { useRef, useState } from "react";
import TrackedLink from "@/components/cinema/TrackedLink";
import { CATALOGUE } from "@/lib/products";
import { RATES, SIGMAFY_RATES, TERMS, TIMEBOX } from "@/lib/pricing";
import { WEB_TIERS } from "@/lib/websites";

const categories = [
  { id: "retainers", label: "Retainers" },
  { id: "training", label: "Training" },
  { id: "sigmafy", label: "Sigmafy Statistics" },
  { id: "consulting", label: "Consulting" },
  { id: "systems", label: "Systems & Automation" },
  { id: "websites", label: "Websites" },
] as const;

type CategoryId = (typeof categories)[number]["id"];

const heroImages: Record<CategoryId, { src: string; position: string }> = {
  retainers: { src: "/imagery/managed-improvement/partnership-close-v1.webp", position: "center 17%" },
  training: { src: "/imagery/training/hero-v2.webp", position: "center 14%" },
  sigmafy: { src: "/imagery/sigmafy/analysis-v1.webp", position: "center 25%" },
  consulting: { src: "/imagery/audit/scope-decision-v1.webp", position: "center 18%" },
  systems: { src: "/imagery/automation/operations-v1.webp", position: "center 12%" },
  websites: { src: "/work/crimson-media.webp", position: "center 30%" },
};

const partnerships = [
  {
    name: "Improvement Programme",
    eyebrow: "One workstream",
    price: RATES.partnershipProgramme,
    annual: "R1.5m annual commitment",
    mobilisation: `${RATES.mobilisationProgramme} mobilisation`,
    line: "A measurable improvement rhythm around one important operational workstream.",
    includes: [
      "3 consulting or automation days each month",
      "Approx. R300,000 annual training allowance",
      "Sigmafy workspace and full Statistics toolkit",
      "Monthly operating review and quarterly sponsor report",
    ],
    href: "/contact?interest=improvement-programme",
  },
  {
    name: "Operational Excellence Partner",
    eyebrow: "Two workstreams",
    price: RATES.partnershipOperational,
    annual: "R2.7m annual commitment",
    mobilisation: `${RATES.mobilisationOperational} mobilisation`,
    line: "Process, capability, systems and evidence under one accountable improvement lead.",
    includes: [
      "6 consulting or automation days each month",
      "Approx. R600,000 annual training allowance",
      "Organisational Sigmafy and capability analysis",
      "Fortnightly reviews and quarterly executive benefits review",
    ],
    href: "/contact?interest=operational-excellence",
    featured: true,
  },
  {
    name: "Transformation Office",
    eyebrow: "Enterprise capability",
    price: RATES.partnershipTransformation,
    annual: "From R4.74m annual commitment",
    mobilisation: "Mobilisation scoped after diagnosis",
    line: "An enterprise improvement office with a named programme lead and specialist capacity.",
    includes: [
      "Three to five active workstreams",
      "10+ consulting or automation days each month",
      "Approx. R1.2m annual training allowance",
      "Enterprise Sigmafy and portfolio reporting",
    ],
    href: "/contact?interest=transformation-office",
  },
];

const diagnostics = [
  { name: "Half-Day Process Review", eyebrow: "See the work", price: RATES.review, time: TIMEBOX.review, line: "Follow one live process and receive a concise build-or-do-not-build recommendation.", href: "/process-review" },
  { name: "Opportunity Audit", eyebrow: "Quantify the opportunity", price: RATES.audit, time: TIMEBOX.audit, line: "Turn an operational concern into three costed findings and one recommended intervention.", href: "/audit" },
  { name: "Extended Audit", eyebrow: "Trace connected processes", price: RATES.auditExtended, time: TIMEBOX.auditExtended, line: "A deeper investigation where failure crosses sites, teams or connected workflows.", href: "/audit" },
];

const trainingOffers = [
  { name: "White Belt Online", price: "Free", meta: "Individual access", line: "A practical online introduction to Six Sigma and process improvement, available immediately.", href: "/training" },
  { name: "Scheduled Belt Training", price: "Per intake", meta: "Live schedule price", line: "Yellow, Green and Black Belt programmes with published dates, delivery mode and seat availability.", href: "/training" },
  { name: "Corporate Cohorts", price: "Scoped", meta: "One cohort", line: "A dedicated class priced around belt level, class size, venue and delivery mode.", href: "/contact?interest=corporate-training" },
  { name: "Capability Programme", price: "Scoped", meta: "Multi-cohort", line: "Training, projects, coaching, statistical tools and benefit verification across a developing internal team.", href: "/contact?interest=training-programme" },
];

const sigmafyPlans = [
  { name: "Free", price: SIGMAFY_RATES.free, unit: "Forever · USD", includes: ["10 essential tools", "Descriptive statistics", "I-MR control chart", "Watermarked outputs"], href: "https://stats.sigmafy.co/#/category/quality" },
  { name: "Practitioner", price: SIGMAFY_RATES.practitioner, unit: "Per month · USD", includes: ["250+ statistical tools", "9 AI assistants", "PDF reports", "Save and rerun analyses"], href: "https://stats.sigmafy.co/#/pricing", featured: true },
  { name: "Team", price: SIGMAFY_RATES.team, unit: "Per month · USD", includes: ["5 user seats", "Shared workspace", "Organisation-branded reports", "Priority support"], href: "/contact?interest=sigmafy" },
];

function CheckList({ items, ember = false }: { items: readonly string[]; ember?: boolean }) {
  return <ul className="pt-checks">{items.map((item) => <li key={item}><span className={ember ? "pt-check pt-check--ember" : "pt-check"}>✓</span>{item}</li>)}</ul>;
}

function CardLink({ href, label, offer, solid = false }: { href: string; label: string; offer: string; solid?: boolean }) {
  return <TrackedLink href={href} eventOffer={offer} className={solid ? "k-btn k-btn--solid" : "k-btn k-btn--ghost"}>{label}<span aria-hidden>→</span></TrackedLink>;
}

export default function PricingTabs({ initialCategory }: { initialCategory?: string }) {
  const [active, setActive] = useState<CategoryId>(() => categories.some((category) => category.id === initialCategory) ? initialCategory as CategoryId : "retainers");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function select(category: CategoryId) {
    setActive(category);
    const url = new URL(window.location.href);
    if (category === "retainers") url.searchParams.delete("category");
    else url.searchParams.set("category", category);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function moveTab(index: number, direction: 1 | -1) {
    const next = (index + direction + categories.length) % categories.length;
    select(categories[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <main className="pt-page pt-page--cards">
      <header className="pt-hero-strip">
        <div
          key={active}
          className="pt-hero-strip__image"
          style={{ backgroundImage: `url(${heroImages[active].src})`, backgroundPosition: heroImages[active].position }}
          aria-hidden="true"
        />
        <div className="k-shell">
          <h1>Pricing.</h1>
          <p>Clear costs for every way to work with 2KO.</p>
        </div>
      </header>

      <div className="pt-tab-wrap pt-tab-wrap--cards"><div className="k-shell"><div className="pt-tabs" role="tablist" aria-label="Pricing categories">
        {categories.map((category, index) => <button key={category.id} ref={(node) => { tabRefs.current[index] = node; }} id={`pricing-tab-${category.id}`} role="tab" aria-selected={active === category.id} aria-controls={`pricing-panel-${category.id}`} tabIndex={active === category.id ? 0 : -1} className={active === category.id ? "pt-tab pt-tab--active" : "pt-tab"} onClick={() => select(category.id)} onKeyDown={(event) => { if (event.key === "ArrowRight") { event.preventDefault(); moveTab(index, 1); } if (event.key === "ArrowLeft") { event.preventDefault(); moveTab(index, -1); } }}><span>{category.label}</span></button>)}
      </div></div></div>

      <div className="k-shell pt-content pt-content--cards">
        <section id="pricing-panel-retainers" role="tabpanel" aria-labelledby="pricing-tab-retainers" hidden={active !== "retainers"}>
          <div className="pt-intro pt-intro--cards"><div><p className="k-mono k-mono--ember">ONGOING OPERATING RELATIONSHIPS</p><h2>Keep improving after the project ends.</h2></div><p>Choose a systems-only relationship, or connect process, training, automation and measurement.</p></div>
          <div className="pt-grid pt-grid--two pt-system-retainers">
            <article className="pt-card pt-card--service">
              <p className="k-mono k-mono--ember">KEEP IT HEALTHY</p><h3>System Care</h3>
              <p className="pt-price"><small>from</small>{RATES.retainerCare}</p><p className="pt-unit">per month · ex VAT · {TERMS.careMinMonths}-month minimum</p>
              <p className="pt-line">Protect, support and incrementally improve one live 2KO production system without buying a full development roadmap.</p>
              <CheckList items={["Hosting administration, monitoring, backups and patching", "Priority support within an agreed response window", "Monthly system health review and maintained improvement backlog", "One planned maintenance or minor improvement day each month", "Quarterly continuity and risk review"]} />
              <CardLink href="/contact?interest=care" label="Discuss System Care" offer="system care" />
            </article>
            <article className="pt-card pt-card--service pt-card--featured">
              <span className="pt-featured">Systems only</span>
              <p className="k-mono k-mono--ember">OPERATE + ADAPT</p><h3>Managed Systems Partnership</h3>
              <p className="pt-price"><small>from</small>{RATES.managedSystems}</p><p className="pt-unit">per month · ex VAT · {TERMS.managedSystemsMinMonths}-month agreement</p>
              <p className="pt-line">Operate and continuously adapt one production system as the process, people and priorities change.</p>
              <CheckList ember items={["Named systems lead and monthly roadmap review", "Monitoring, backups, patching and priority support", "Three planned development or automation days each month", "Minor enhancements, workflow adaptations and release records"]} />
              <CardLink href="/contact?interest=managed-systems" label="Discuss managed systems" offer="managed systems partnership" solid />
            </article>
          </div>
          <div className="pt-subsection"><p className="k-mono k-mono--ember">INTEGRATED IMPROVEMENT</p><div><h3>Need process consulting, training and Sigmafy too?</h3><p>These annual partnerships coordinate all four capabilities around measurable workstreams.</p></div></div>
          <div className="pt-grid pt-grid--three">{partnerships.map((plan) => <article key={plan.name} className={`pt-card pt-card--plan${plan.featured ? " pt-card--featured" : ""}`}>
            {plan.featured && <span className="pt-featured">Recommended</span>}
            <p className="k-mono k-mono--ember">{plan.eyebrow}</p><h3>{plan.name}</h3>
            <p className="pt-price"><small>from</small>{plan.price}</p><p className="pt-unit">per month · ex VAT</p>
            <div className="pt-contract"><strong>{plan.annual}</strong><span>{plan.mobilisation}</span></div>
            <p className="pt-line">{plan.line}</p><CheckList items={plan.includes} ember={plan.featured} />
            <CardLink href={plan.href} label="Discuss this partnership" offer={plan.name} solid={plan.featured} />
          </article>)}</div>
        </section>

        <section id="pricing-panel-training" role="tabpanel" aria-labelledby="pricing-tab-training" hidden={active !== "training"}>
          <div className="pt-intro pt-intro--cards"><div><p className="k-mono k-mono--ember">TRAINING</p><h2>Develop one person or an internal capability.</h2></div><p>Open-course rates follow the live intake schedule. Corporate programmes are scoped by cohort.</p></div>
          <div className="pt-grid pt-grid--four">{trainingOffers.map((offer) => <article key={offer.name} className="pt-card pt-card--compact"><div className="pt-card-top"><p className="k-mono k-mono--ember">{offer.meta}</p></div><h3>{offer.name}</h3><p className="pt-price pt-price--text">{offer.price}</p><p className="pt-line">{offer.line}</p><CardLink href={offer.href} label="View this offer" offer={offer.name} /></article>)}</div>
        </section>

        <section id="pricing-panel-sigmafy" role="tabpanel" aria-labelledby="pricing-tab-sigmafy" hidden={active !== "sigmafy"}>
          <div className="pt-intro pt-intro--cards"><div><p className="k-mono k-mono--ember">SIGMAFY STATISTICS</p><h2>Statistical tools without statistical friction.</h2></div><p>Standalone software is priced in US dollars. Full access is included in Sigmafy platform membership.</p></div>
          <div className="pt-grid pt-grid--three">{sigmafyPlans.map((plan) => <article key={plan.name} className={`pt-card pt-card--plan${plan.featured ? " pt-card--featured" : ""}`}>{plan.featured && <span className="pt-featured">Most popular</span>}<p className="k-mono k-mono--ember">SIGMAFY STATISTICS</p><h3>{plan.name}</h3><p className="pt-price">{plan.price}</p><p className="pt-unit">{plan.unit}</p><CheckList items={plan.includes} ember={plan.featured} /><CardLink href={plan.href} label={`Choose ${plan.name}`} offer={`Sigmafy ${plan.name}`} solid={plan.featured} /></article>)}</div>
        </section>

        <section id="pricing-panel-consulting" role="tabpanel" aria-labelledby="pricing-tab-consulting" hidden={active !== "consulting"}>
          <div className="pt-intro pt-intro--cards"><div><p className="k-mono k-mono--ember">CONSULTING</p><h2>Buy only the certainty the decision needs.</h2></div><p>Start small. Go deeper only when the investment needs evidence across connected processes.</p></div>
          <div className="pt-grid pt-grid--three">{diagnostics.map((offer) => <article key={offer.name} className="pt-card pt-card--compact"><div className="pt-card-top"><p className="k-mono k-mono--ember">{offer.eyebrow}</p><span>{offer.time}</span></div><h3>{offer.name}</h3><p className="pt-price">{offer.price}</p><p className="pt-unit">fixed scope · ex VAT</p><p className="pt-line">{offer.line}</p><CardLink href={offer.href} label="See what you receive" offer={offer.name} /></article>)}</div>
          <aside className="pt-aside"><div><p className="k-mono k-mono--ember">ADDITIONAL WORK</p><h3>{RATES.dayRate}/day · {RATES.hourlyRate}/hour</h3></div><p>Used only for agreed out-of-scope work or small changes. The amount is approved in writing before work begins.</p><CardLink href="/contact?interest=consulting" label="Discuss consulting" offer="additional consulting" /></aside>
        </section>

        <section id="pricing-panel-systems" role="tabpanel" aria-labelledby="pricing-tab-systems" hidden={active !== "systems"}>
          <div className="pt-intro pt-intro--cards"><div><p className="k-mono k-mono--ember">SYSTEMS & AUTOMATION</p><h2>Start with the known price.</h2></div><p>Use a fixed product when the process is familiar. Commission a pilot or custom build when it is not.</p></div>
          <div className="pt-catalogue">{CATALOGUE.map((item) => <TrackedLink key={item.name} href={item.href} eventOffer={item.name} className="pt-row"><div><p className="k-mono">{item.timebox}</p><h3>{item.name}</h3><p>{item.summary}</p></div><strong>{item.price}</strong><span className="pt-arrow" aria-hidden>→</span></TrackedLink>)}</div>
          <div className="pt-grid pt-grid--two pt-custom-builds"><article className="pt-card"><p className="k-mono k-mono--ember">BOUNDED AUTOMATION</p><h3>Proof-of-Value Pilot</h3><p className="pt-price pt-price--range">from {RATES.pilotFrom}</p><p className="pt-unit">{TIMEBOX.pilot} · ex VAT</p><p className="pt-line">One workflow, one measurable result and a bounded route into a larger implementation.</p><CardLink href="/automation" label="Explore automation" offer="proof of value pilot" /></article><article className="pt-card"><p className="k-mono k-mono--ember">CONNECTED OPERATIONS</p><h3>Custom Operational System</h3><p className="pt-price pt-price--range">{RATES.buildFrom}–{RATES.buildTo}</p><p className="pt-unit">{TIMEBOX.buildPhase} · ex VAT</p><p className="pt-line">Phased software for connected processes, roles, rules, integrations and auditable records.</p><CardLink href="/systems" label="Explore systems" offer="custom operational system" /></article></div>
          <aside className="pt-managed-strip">
            <div><p className="k-mono k-mono--ember">BUILD → STABILISE → OPERATE → ADAPT</p><h3>Managed Systems Partnership</h3><p>The build is scoped separately. The operating partnership begins at go-live and keeps one production system healthy, supported and moving with the business.</p></div>
            <div className="pt-managed-strip__price"><span>from</span><strong>{RATES.managedSystems}</strong><small>per month · ex VAT<br />{TERMS.managedSystemsMinMonths}-month agreement</small></div>
            <CardLink href="/contact?interest=managed-systems" label="Discuss managed systems" offer="managed systems partnership" solid />
          </aside>
        </section>

        <section id="pricing-panel-websites" role="tabpanel" aria-labelledby="pricing-tab-websites" hidden={active !== "websites"}>
          <div className="pt-intro pt-intro--cards"><div><p className="k-mono k-mono--ember">WEBSITES</p><h2>Priced before the discovery call.</h2></div><p>Copy, design, development and handover included. You own the finished build outright.</p></div>
          <div className="pt-grid pt-grid--four">{WEB_TIERS.map((tier) => <article key={tier.slug} className={`pt-card pt-card--compact${tier.featured ? " pt-card--featured" : ""}`}>{tier.featured && <span className="pt-featured">Most popular</span>}<div className="pt-card-top"><p className="k-mono k-mono--ember">{tier.time}</p></div><h3>{tier.name}</h3><p className="pt-price pt-price--text">{tier.price}</p><p className="pt-line">{tier.line} {tier.for}</p><CardLink href={`/websites/${tier.slug}`} label="See the full scope" offer={`website ${tier.name}`} solid={tier.featured} /></article>)}</div>
          <div className="pt-notice"><strong>Optional care from {RATES.careBasic}/month.</strong><span>Care+ is {RATES.carePlus}/month and Partner is {RATES.carePartner}/month. Every build includes {TERMS.postLaunchSupportDays} days of post-launch support.</span></div>
        </section>

        <details className="pt-terms"><summary><span><strong>Commercial terms</strong><small className="k-mono">Payment, scope, ownership and ongoing work</small></span><span aria-hidden>+</span></summary><div className="pt-term-grid"><div><h3>Payment</h3><p>Reviews, audits and Get Off Excel are 50% on signature and 50% on delivery. Pilots are 40 / 40 / 20. Builds follow milestones.</p></div><div><h3>Partnerships</h3><p>Managed Systems and integrated partnerships are {TERMS.partnershipMinMonths}-month agreements. The initial system build is separately scoped.</p></div><div><h3>Scope changes</h3><p>Additional work is quoted in advance at {RATES.dayRate} per day or {RATES.hourlyRate} per hour.</p></div><div><h3>Ownership</h3><p>Source code, documentation and business data are yours. External licences are billed at cost plus {TERMS.passthroughMargin}.</p></div></div></details>
      </div>
    </main>
  );
}
