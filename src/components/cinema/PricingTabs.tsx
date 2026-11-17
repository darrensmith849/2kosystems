"use client";

import { useRef, useState } from "react";
import TrackedLink from "@/components/cinema/TrackedLink";
import { RATES, SIGMAFY_RATES, TERMS } from "@/lib/pricing";

const categories = [
  { id: "training", label: "Training" },
  { id: "retainers", label: "Partnerships" },
  { id: "sigmafy", label: "Sigmafy Statistics" },
] as const;

type CategoryId = (typeof categories)[number]["id"];

const partnerships = [
  {
    name: "Improvement Programme",
    eyebrow: "One workstream",
    price: RATES.partnershipProgramme,
    annual: "R1.5m annual commitment",
    mobilisation: `${RATES.mobilisationProgramme} mobilisation`,
    line: "A measurable improvement rhythm around one important operational workstream.",
    includes: [
      "3 coaching or consulting days each month",
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
    line: "Several business units, belt cohorts and savings evidence under one accountable programme lead.",
    includes: [
      "6 coaching or consulting days each month",
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
      "10+ coaching or consulting days each month",
      "Approx. R1.2m annual training allowance",
      "Enterprise Sigmafy and portfolio reporting",
    ],
    href: "/contact?interest=transformation-office",
  },
];


const trainingOffers = [
  { name: "Deployment programme", price: "Scoped", meta: "Whole organisation", line: "White Belt for everyone, then Yellow, Green and Black Belt waves running real projects on Sigmafy.", href: "/contact?interest=training" },
  { name: "Pilot cohort", price: "Scoped", meta: "One cohort", line: "One Green Belt cohort of about 20 on real projects, so you see results before you scale.", href: "/contact?interest=training" },
  { name: "Scheduled Belt Training", price: "Per intake", meta: "Live schedule price", line: "Yellow, Green and Black Belt programmes with published dates, delivery mode and seat availability.", href: "/training" },
  { name: "White Belt Online", price: "Free", meta: "Individual access", line: "A practical online introduction to Six Sigma and process improvement, available immediately.", href: "/training" },
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
  const [active, setActive] = useState<CategoryId>(() => categories.some((category) => category.id === initialCategory) ? initialCategory as CategoryId : "training");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function select(category: CategoryId) {
    setActive(category);
    const url = new URL(window.location.href);
    if (category === "training") url.searchParams.delete("category");
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
        <div className="pt-hero-strip__tech" aria-hidden>
          <span className="pt-trace pt-trace--1" />
          <span className="pt-trace pt-trace--2" />
          <span className="pt-trace pt-trace--3" />
        </div>
        <div className="k-shell">
          <h1>Pricing.</h1>
          <p>Clear costs for training, partnerships and Sigmafy.</p>
        </div>
      </header>

      <div className="pt-tab-wrap pt-tab-wrap--cards"><div className="k-shell"><div className="pt-tabs" role="tablist" aria-label="Pricing categories">
        {categories.map((category, index) => <button key={category.id} ref={(node) => { tabRefs.current[index] = node; }} id={`pricing-tab-${category.id}`} role="tab" aria-selected={active === category.id} aria-controls={`pricing-panel-${category.id}`} tabIndex={active === category.id ? 0 : -1} className={active === category.id ? "pt-tab pt-tab--active" : "pt-tab"} onClick={() => select(category.id)} onKeyDown={(event) => { if (event.key === "ArrowRight") { event.preventDefault(); moveTab(index, 1); } if (event.key === "ArrowLeft") { event.preventDefault(); moveTab(index, -1); } }}><span>{category.label}</span></button>)}
      </div></div></div>

      <div className="k-shell pt-content pt-content--cards">
        <section id="pricing-panel-retainers" role="tabpanel" aria-labelledby="pricing-tab-retainers" hidden={active !== "retainers"}>
          <div className="pt-intro pt-intro--cards"><div><p className="k-mono k-mono--ember">IMPROVEMENT PARTNERSHIPS</p><h2>We stay inside the programme.</h2></div><p>Annual partnerships for coaching, sign-off, governance and savings tracking, with a training allowance and Sigmafy included.</p></div>
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
          <div className="pt-intro pt-intro--cards"><div><p className="k-mono k-mono--ember">TRAINING</p><h2>From one cohort to the whole organisation.</h2></div><p>Deployments and corporate cohorts are scoped with you. Open-course rates follow the live intake schedule.</p></div>
          <div className="pt-grid pt-grid--four">{trainingOffers.map((offer) => <article key={offer.name} className="pt-card pt-card--compact"><div className="pt-card-top"><p className="k-mono k-mono--ember">{offer.meta}</p></div><h3>{offer.name}</h3><p className="pt-price pt-price--text">{offer.price}</p><p className="pt-line">{offer.line}</p><CardLink href={offer.href} label="View this offer" offer={offer.name} /></article>)}</div>
        </section>

        <section id="pricing-panel-sigmafy" role="tabpanel" aria-labelledby="pricing-tab-sigmafy" hidden={active !== "sigmafy"}>
          <div className="pt-intro pt-intro--cards"><div><p className="k-mono k-mono--ember">SIGMAFY STATISTICS</p><h2>Statistical tools without statistical friction.</h2></div><p>Standalone software is priced in US dollars. Full access is included in Sigmafy platform membership.</p></div>
          <div className="pt-grid pt-grid--three">{sigmafyPlans.map((plan) => <article key={plan.name} className={`pt-card pt-card--plan${plan.featured ? " pt-card--featured" : ""}`}>{plan.featured && <span className="pt-featured">Most popular</span>}<p className="k-mono k-mono--ember">SIGMAFY STATISTICS</p><h3>{plan.name}</h3><p className="pt-price">{plan.price}</p><p className="pt-unit">{plan.unit}</p><CheckList items={plan.includes} ember={plan.featured} /><CardLink href={plan.href} label={`Choose ${plan.name}`} offer={`Sigmafy ${plan.name}`} solid={plan.featured} /></article>)}</div>
        </section>

        <details className="pt-terms"><summary><span><strong>Commercial terms</strong><small className="k-mono">Payment, partnerships, certificates and scope</small></span><span aria-hidden>+</span></summary><div className="pt-term-grid"><div><h3>Payment</h3><p>Open courses are paid on booking. Corporate cohorts are invoiced per wave, and partnerships monthly.</p></div><div><h3>Partnerships</h3><p>Partnerships are {TERMS.partnershipMinMonths}-month agreements. Mobilisation is invoiced once, at the start.</p></div><div><h3>Certificates</h3><p>Certificates are issued once the course is paid and the work is signed off.</p></div><div><h3>Scope changes</h3><p>Additional work is quoted in advance at {RATES.dayRate} per day or {RATES.hourlyRate} per hour.</p></div></div></details>
      </div>
    </main>
  );
}
