import type { ReactNode } from "react";
import TrackedLink from "@/components/cinema/TrackedLink";
import { DEPLOYMENT_RATES, DEPLOYMENT_TIERS, LIVE_HOUR_USE, SAVINGS_BASIS, priceDeploymentTier, type DeploymentTier } from "@/lib/pricing";

// One deployment table. Online is included for every delegate; each tier adds
// a yearly bank of live trainer hours the client spends on any belt, in any
// format. Every column adds up from the rates in lib/pricing.ts.
const priced = DEPLOYMENT_TIERS.map((tier) => ({ tier, price: priceDeploymentTier(tier) }));

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const rand = (n: number) => `R${fmt(n)}`;
const short = (n: number) => (n >= 1_000_000 ? `R${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}m` : `R${Math.round(n / 1000)}k`);
const pct = (n: number) => `${Math.round(n * 100)}%`;
const times = (n: number) => `${Math.round(n)}×`;

const icons = {
  online: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M2 20h20" /></>,
  hybrid: <><circle cx="12" cy="12" r="9" /><path d="M10 8.5l5 3.5-5 3.5z" /></>,
  virtual: <><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l6-3v10l-6-3" /></>,
  onsite: <><path d="M4 21V6l8-3 8 3v15" /><path d="M9 21v-5h6v5" /><path d="M8 9h1M15 9h1M8 13h1M15 13h1" /></>,
};

const ways: { id: keyof typeof icons; name: string; line: string; uses: string; per: string; included?: boolean }[] = [
  { id: "online", name: "Online", line: "Software and every recorded lesson", uses: "Included for everyone", per: "Uses no hours", included: true },
  { id: "hybrid", name: "Hybrid", line: "Recorded, with live check-ins", uses: `${LIVE_HOUR_USE.hybridHoursPerCohortDay * 60} min a training day`, per: "per cohort" },
  { id: "virtual", name: "Live virtual", line: "A trainer live, online", uses: `${LIVE_HOUR_USE.virtualHoursPerHour} hour per hour`, per: "training or coaching" },
  { id: "onsite", name: "On-site", line: "A trainer in your building", uses: `${LIVE_HOUR_USE.onsiteHoursPerHour} hours per hour`, per: "plus travel at cost" },
];

type Row = { label: string; hint?: string; cell: (tier: DeploymentTier, index: number) => ReactNode; strong?: boolean; tone?: "signal" | "ember" };

const tick = (on: boolean) => (on ? "✓" : "—");
const cohorts = (n: number) => <>{fmt(n)}<small>cohorts</small></>;

const sections: { title: string; rows: Row[] }[] = [
  {
    title: "Online, for everyone",
    rows: [
      { label: "White Belt for every delegate", hint: "Simulation, exam and certificate", cell: () => "✓" },
      { label: "Yellow Belt places", hint: "Online course, mini-project, exam", cell: (t) => fmt(t.places.yellow) },
      { label: "Green Belt places", hint: "Online course and a real project", cell: (t) => fmt(t.places.green) },
      { label: "Black Belt places", hint: "Online course and a strategic project", cell: (t) => fmt(t.places.black) },
      { label: "Sigmafy licence for every delegate", hint: "Learning, projects, exams, Statistics", cell: () => "✓" },
      { label: "AI coach and trainer sign-off", hint: "On every project", cell: () => "✓" },
    ],
  },
  {
    title: "Live trainer hours, spent your way",
    rows: [
      { label: "Live trainer hours a year", hint: "Any belt, any format", cell: (t) => fmt(t.liveHours), strong: true, tone: "ember" },
      { label: "Enough for, as live virtual", hint: `Green Belt cohorts of 20, about ${LIVE_HOUR_USE.liveGreenBeltCohortHours} hours each`, cell: (_, i) => cohorts(priced[i].price.cohorts.virtual) },
      { label: "Or, as hybrid", hint: `Check-ins for ${LIVE_HOUR_USE.greenBeltTrainingDays}-day Green Belt cohorts`, cell: (_, i) => cohorts(priced[i].price.cohorts.hybrid) },
      { label: "Or, on-site", hint: `At ${LIVE_HOUR_USE.onsiteHoursPerHour} hours per hour, plus travel`, cell: (_, i) => cohorts(priced[i].price.cohorts.onsite) },
    ],
  },
  {
    title: "Programme",
    rows: [
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
      { label: "Online belt places", hint: "Yellow / Green / Black off list", cell: (t, i) => <>{short(priced[i].price.belts)}<small>{`${pct(t.discount.yellow)} / ${pct(t.discount.green)} / ${pct(t.discount.black)} off`}</small></> },
      { label: "Live trainer hours", hint: `Hours × ${rand(DEPLOYMENT_RATES.liveHour)}`, cell: (t, i) => <>{short(priced[i].price.liveHours)}<small>{t.hoursDiscount ? `${pct(t.hoursDiscount)} off` : "list"}</small></> },
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
  const list = DEPLOYMENT_RATES.onlineBelt;

  return (
    <div className="dp">
      <section className="dp-ways" aria-labelledby="dp-ways-title">
        <p id="dp-ways-title" className="k-mono">Ways to use your hours</p>
        <ul className="dp-ways__grid">
          {ways.map((way) => (
            <li key={way.id} className="dp-way" data-included={way.included || undefined}>
              <span className="dp-way__icon" aria-hidden>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[way.id]}</svg>
              </span>
              <strong>{way.name}</strong>
              <span className="dp-way__line">{way.line}</span>
              <span className="dp-way__uses">{way.uses}</span>
              <span className="dp-way__per">{way.per}</span>
            </li>
          ))}
        </ul>
        <p className="dp-ways__more">Need more? Extra hours are {rand(DEPLOYMENT_RATES.liveHour)} each, or {rand(DEPLOYMENT_RATES.liveDay)} a day.</p>
      </section>

      <div className="dp-scroll" tabIndex={0} role="region" aria-label="Deployment tiers compared">
        <table className="dp-table">
          <caption className="sr-only">Deployment tiers: what each includes, its yearly price and estimated savings</caption>
          <thead>
            <tr>
              <th scope="col" className="dp-corner">Per year</th>
              {priced.map(({ tier, price }) => (
                <th key={tier.id} scope="col">
                  <span className="dp-head">
                    <span className="k-mono">{tier.name}</span>
                    <span className="dp-head__cap">Up to {fmt(tier.cap)}</span>
                    <span className="dp-head__unit">delegates a year</span>
                    <span className="dp-head__price k-num">{short(price.total / 12)}</span>
                    <span className="dp-head__unit">a month</span>
                    <span className="dp-head__each k-num">{rand(price.perDelegate)} a delegate</span>
                  </span>
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
                  {DEPLOYMENT_TIERS.map((tier, index) => <td key={tier.id}>{row.cell(tier, index)}</td>)}
                </tr>
              ))}
            </tbody>
          ))}
          <tfoot>
            <tr>
              <td />
              {priced.map(({ tier }, index) => (
                <td key={tier.id}>
                  <TrackedLink href="/contact?interest=training" eventOffer={`deployment ${tier.name}`} className="k-btn k-btn--ghost dp-cta">
                    {index === priced.length - 1 ? "Talk to us" : "Plan this tier"}
                  </TrackedLink>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="dp-note">
        Belt places are priced at our published pre-paid online prices (Yellow Belt {rand(list.yellow)}, Green Belt {rand(list.green)}, Black Belt {rand(list.black)} a person), live hours at {rand(DEPLOYMENT_RATES.liveHour)} an hour. Ex VAT, billed monthly on an annual term. Unused hours do not roll over. Your final quote follows a scoping call.
      </p>

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
