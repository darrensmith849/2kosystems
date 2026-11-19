"use client";

import { useState, type ReactNode } from "react";
import TrackedLink from "@/components/cinema/TrackedLink";
import { DEPLOYMENT_RATES, DEPLOYMENT_TIERS, SAVINGS_BASIS, priceDeploymentTier, type DeploymentTier } from "@/lib/pricing";

// One deployment table: what each tier includes, how its price adds up from
// published rates, and what it could save on published benchmarks. The slider
// lights up the visitor's tier; every column is always visible to compare.
const MIN_DELEGATES = 10;
const MAX_DELEGATES = 50_000;

const priced = DEPLOYMENT_TIERS.map((tier) => ({ tier, price: priceDeploymentTier(tier) }));

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const rand = (n: number) => `R${fmt(n)}`;
const short = (n: number) => (n >= 1_000_000 ? `R${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}m` : `R${Math.round(n / 1000)}k`);
const pct = (n: number) => `${Math.round(n * 100)}%`;
const times = (n: number) => `${Math.round(n)}×`;

function delegatesAt(position: number) {
  return Math.round(MIN_DELEGATES * Math.pow(MAX_DELEGATES / MIN_DELEGATES, position / 100));
}

function tierFor(delegates: number) {
  const index = DEPLOYMENT_TIERS.findIndex((tier) => delegates <= tier.cap);
  return index === -1 ? DEPLOYMENT_TIERS.length - 1 : index;
}

type Row = { label: string; hint?: string; cell: (tier: DeploymentTier, index: number) => ReactNode; strong?: boolean; tone?: "signal" | "ember" };

const tick = (on: boolean) => (on ? "✓" : "—");

const sections: { title: string; rows: Row[] }[] = [
  {
    title: "What you get",
    rows: [
      { label: "White Belt for every delegate", hint: "Simulation, exam and certificate", cell: () => "✓" },
      { label: "Yellow Belt places", hint: "Guided mini-projects", cell: (t) => fmt(t.places.yellow) },
      { label: "Green Belt places", hint: "Each runs a real project", cell: (t) => fmt(t.places.green) },
      { label: "Black Belt places", hint: "Your future coaches", cell: (t) => fmt(t.places.black) },
      { label: "Sigmafy licence for every delegate", hint: "Learning, projects, exams, Statistics", cell: () => "✓" },
      { label: "Coaching days per month", hint: "On site or live online", cell: (t) => fmt(t.coachingDaysPerMonth) },
      { label: "Executive savings report", hint: "Against a measured baseline", cell: (t) => t.report },
      { label: "Named programme lead", hint: "One person accountable", cell: (t) => tick(t.programmeLead) },
      { label: "Train-the-trainer", hint: "Your Black Belts licensed to coach", cell: (t) => tick(t.trainTheTrainer) },
      { label: "Simulation set in your industry", hint: "Your processes, your language", cell: (t) => tick(t.industrySimulation) },
      { label: "Single sign-on, data held in South Africa", hint: "For IT and procurement", cell: (t) => tick(t.singleSignOn) },
    ],
  },
  {
    title: "How the price adds up",
    rows: [
      { label: "Belt training", hint: "Yellow / Green / Black off list", cell: (_, i) => <>{short(priced[i].price.belts)}<small>{`${pct(priced[i].tier.discount.yellow)} / ${pct(priced[i].tier.discount.green)} / ${pct(priced[i].tier.discount.black)} off`}</small></> },
      { label: "Coaching", hint: `Days × 12 × ${rand(DEPLOYMENT_RATES.coachingDay)}`, cell: (_, i) => short(priced[i].price.coaching) },
      { label: "Sigmafy licences", hint: "Per delegate per year", cell: (t, i) => <>{short(priced[i].price.licences)}<small>{`${rand(t.licencePerDelegate)} each`}</small></> },
      { label: "Total per year", cell: (_, i) => short(priced[i].price.total), strong: true },
    ],
  },
  {
    title: "What it could save you (estimate)",
    rows: [
      { label: "Estimated yearly savings", hint: "Green and Black Belt projects only", cell: (_, i) => `${short(priced[i].price.savingsLow)}–${short(priced[i].price.savingsLikely)}`, strong: true, tone: "signal" },
      { label: "Return on cost", hint: "Savings ÷ price, first year", cell: (_, i) => `${times(priced[i].price.savingsLow / priced[i].price.total)}–${times(priced[i].price.savingsLikely / priced[i].price.total)}`, strong: true, tone: "ember" },
    ],
  },
];

export default function DeploymentPricing() {
  const [position, setPosition] = useState(70);
  const delegates = delegatesAt(position);
  const current = tierFor(delegates);
  const { tier, price } = priced[current];
  const list = DEPLOYMENT_RATES.beltList;

  return (
    <div className="dp">
      <div className="dp-top">
        <p className="dp-built">
          Every price adds up from the rows below it. Built from Yellow Belt {rand(list.yellow)}, Green Belt {rand(list.green)} and Black Belt {rand(list.black)} a person, coaching at {rand(DEPLOYMENT_RATES.coachingDay)} a day, and a Sigmafy licence per delegate.
        </p>
        <div className="dp-picker">
          <div className="dp-picker__head">
            <label htmlFor="dp-delegates">Delegates per year</label>
            <strong className="k-num">{fmt(delegates)}</strong>
          </div>
          <input
            id="dp-delegates"
            className="dp-range"
            type="range"
            min={0}
            max={100}
            step={1}
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
            aria-valuetext={`${fmt(delegates)} delegates per year, ${tier.name} tier`}
          />
          <dl className="dp-picker__facts">
            <div><dt>Your tier</dt><dd>{tier.name}</dd></div>
            <div><dt>Per delegate</dt><dd className="k-num dp-signal">{rand(price.perDelegate)}</dd></div>
            <div><dt>Estimated return</dt><dd className="k-num dp-ember">{times(price.savingsLow / price.total)}–{times(price.savingsLikely / price.total)}</dd></div>
          </dl>
        </div>
      </div>

      <div className="dp-scroll" tabIndex={0} role="region" aria-label="Deployment tiers compared">
        <table className="dp-table">
          <caption className="sr-only">Deployment tiers, what each includes, its yearly price and estimated savings</caption>
          <thead>
            <tr>
              <th scope="col" className="dp-corner">Per year</th>
              {priced.map(({ tier: column, price: columnPrice }, index) => (
                <th key={column.id} scope="col" data-current={index === current || undefined}>
                  <button type="button" className="dp-head" onClick={() => setPosition(Math.floor((Math.log(column.cap / MIN_DELEGATES) / Math.log(MAX_DELEGATES / MIN_DELEGATES)) * 100))}>
                    <span className="k-mono">{column.name}</span>
                    <span className="dp-head__cap">Up to {fmt(column.cap)}</span>
                    <span className="dp-head__unit">delegates a year</span>
                    <span className="dp-head__price k-num">{short(columnPrice.total / 12)}</span>
                    <span className="dp-head__unit">a month</span>
                    <span className="dp-head__each k-num">{rand(columnPrice.perDelegate)} a delegate</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          {sections.map((section) => (
            <tbody key={section.title}>
              <tr className="dp-section"><th scope="colgroup" colSpan={priced.length + 1}><span>{section.title}</span></th></tr>
              {section.rows.map((row) => (
                <tr key={row.label} data-strong={row.strong || undefined} data-tone={row.tone}>
                  <th scope="row"><span>{row.label}</span>{row.hint && <small>{row.hint}</small>}</th>
                  {DEPLOYMENT_TIERS.map((column, index) => <td key={column.id} data-current={index === current || undefined}>{row.cell(column, index)}</td>)}
                </tr>
              ))}
            </tbody>
          ))}
          <tfoot>
            <tr>
              <td />
              {priced.map(({ tier: column }, index) => (
                <td key={column.id} data-current={index === current || undefined}>
                  <TrackedLink href="/contact?interest=training" eventOffer={`deployment ${column.name}`} className={`k-btn ${index === current ? "k-btn--solid" : "k-btn--ghost"} dp-cta`}>
                    {index === priced.length - 1 ? "Talk to us" : "Plan this tier"}
                  </TrackedLink>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="dp-note">Ex VAT, billed monthly on an annual term. Your final quote follows a scoping call.</p>

      <aside className="dp-sources" aria-labelledby="dp-sources-title">
        <p id="dp-sources-title" className="k-mono k-mono--ember">Where the savings estimate comes from</p>
        <p>The savings rows use published benchmarks, then deliberately count less than they report.</p>
        <ul>
          {SAVINGS_BASIS.sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}
          <li>We assume only {pct(SAVINGS_BASIS.completionRate)} of projects finish. We found no published completion rate, so this is our own cautious assumption, not a benchmark.</li>
          <li>Yellow and White Belt improvements are left out: there is no reliable published figure for them.</li>
          <li>The low end of each range halves the estimate again. Savings are not a promise; your own baseline decides the real figure.</li>
        </ul>
      </aside>
    </div>
  );
}
