"use client";

import { Fragment, useState, type ReactNode } from "react";
import TrackedLink from "@/components/cinema/TrackedLink";
import {
  BELT_CREDITS,
  BELT_PRICES,
  COACHING_DAY_RATE,
  CREDIT_PACKS,
  beltCredits,
  packCredits,
  DEPLOYMENT_MODES,
  DEPLOYMENT_TIERS,
  SAVINGS_BASIS,
  priceDeploymentTier,
  type DeliveryFormat,
  type DeploymentMode,
  type DeploymentTier,
  type DeploymentPrice,
} from "@/lib/pricing";

// One deployment table. A switch picks one format for everyone (hybrid by
// default) or a mix by belt; the first shows four format cards, on-site first. Every column adds up from the
// rates in lib/pricing.ts and reprices when the choice changes.
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const rand = (n: number) => `R${fmt(n)}`;
const short = (n: number) => (n >= 1_000_000 ? `R${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}m` : `R${Math.round(n / 1000)}k`);
const pct = (n: number) => `${Math.round(n * 100)}%`;
const times = (n: number) => `${Math.round(n)}×`;

// Most live time first, so each step to the right reads as money saved.
const FORMATS: readonly DeliveryFormat[] = ["onsite", "virtual", "hybrid", "online"];
const RECOMMENDED: DeliveryFormat = "hybrid";
const STEP_GIVES_UP: Partial<Record<DeliveryFormat, string>> = { virtual: "No travel", hybrid: "Shorter live sessions", online: "No live sessions" };

/** The most a format saves against on-site, across the tiers. */
const SAVING_VS_ONSITE = Object.fromEntries(
  FORMATS.map((format) => [
    format,
    Math.max(...DEPLOYMENT_TIERS.map((tier, index) => 1 - priceDeploymentTier(tier, index, format).total / priceDeploymentTier(tier, index, "onsite").total)),
  ]),
) as Record<DeliveryFormat, number>;
const FORMAT_WORD: Record<DeliveryFormat, string> = { online: "online", hybrid: "hybrid", virtual: "live virtual", onsite: "on-site" };

const paths: Record<DeliveryFormat | "mix" | "single" | "arrow", ReactNode> = {
  online: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M2 20h20" /></>,
  hybrid: <><circle cx="12" cy="12" r="9" /><path d="M10 8.5l5 3.5-5 3.5z" /></>,
  virtual: <><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l6-3v10l-6-3" /></>,
  onsite: <><path d="M4 21V6l8-3 8 3v15" /><path d="M9 21v-5h6v5" /><path d="M8 9h1M15 9h1M8 13h1M15 13h1" /></>,
  mix: <><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></>,
  single: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="9" cy="6" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="7" cy="18" r="2" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};

function Icon({ name, size = 20 }: { name: keyof typeof paths; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>;
}

type Priced = { tier: DeploymentTier; price: DeploymentPrice };
type Row = { label: string; hint?: string; cell: (row: Priced) => ReactNode; strong?: boolean; tone?: "signal" | "ember" };

const tick = (on: boolean) => (on ? "✓" : "—");

function sectionsFor(mode: DeploymentMode): { title: string; rows: Row[] }[] {
  const plan = DEPLOYMENT_MODES[mode];
  return [
    {
      title: "What you get",
      rows: [
        { label: "White Belt for every delegate", hint: "Simulation, exam and certificate, online", cell: () => "✓" },
        { label: "Yellow Belt places", hint: `Delivered ${FORMAT_WORD[plan.belts.yellow]}`, cell: ({ tier }) => fmt(tier.places.yellow) },
        { label: "Orange Belt places", hint: "Delivered online · a small AI-marked project", cell: () => "With credits" },
        { label: "Green Belt places", hint: `Delivered ${FORMAT_WORD[plan.belts.green]} · each runs a real project`, cell: ({ tier }) => fmt(tier.places.green) },
        { label: "Black Belt places", hint: `Delivered ${FORMAT_WORD[plan.belts.black]} · your future coaches`, cell: ({ tier }) => fmt(tier.places.black) },
        { label: "Live trainer time", hint: "How much of the training is live", cell: () => plan.liveTime },
        { label: "Sigmafy licence for every delegate", hint: "Learning, projects, exams, Statistics", cell: () => "✓" },
        { label: "Coaching days per month", hint: "Between training days", cell: ({ price }) => (price.coachingDaysPerMonth ? fmt(price.coachingDaysPerMonth) : "AI coach") },
        { label: "Executive savings report", hint: "Against a measured baseline", cell: ({ tier }) => tier.report },
        { label: "Named programme lead", hint: "One person accountable", cell: ({ tier }) => tick(tier.programmeLead) },
        { label: "Train-the-trainer", hint: "Your Black Belts licensed to coach", cell: ({ tier }) => tick(tier.trainTheTrainer) },
        { label: "Simulation set in your industry", hint: "Your processes, your language", cell: ({ tier }) => tick(tier.industrySimulation) },
        { label: "Single sign-on, data held in South Africa", hint: "For IT and procurement", cell: ({ tier }) => tick(tier.singleSignOn) },
      ],
    },
    {
      title: "How the price adds up",
      rows: [
        { label: "Belt training", hint: "Yellow / Green / Black off list", cell: ({ price }) => <>{short(price.belts)}<small>{`${pct(price.discount.yellow)} / ${pct(price.discount.green)} / ${pct(price.discount.black)} off`}</small></> },
        { label: "Coaching", hint: `Days × 12 × ${rand(COACHING_DAY_RATE)}`, cell: ({ price }) => (price.coaching ? short(price.coaching) : "—") },
        { label: "Sigmafy licences", hint: "Per delegate per year", cell: ({ tier, price }) => <>{short(price.licences)}<small>{`${rand(tier.licencePerDelegate)} each`}</small></> },
        { label: "Travel and accommodation", hint: "For trainers on site", cell: () => (plan.travelAtCost ? "At cost" : "—") },
        { label: "Total per year", cell: ({ price }) => short(price.total), strong: true },
      ],
    },
    {
      title: "What it could save you (estimate)",
      rows: [
        { label: "Estimated yearly savings", hint: "Green and Black Belt projects only", cell: ({ price }) => `${short(price.savingsLow)}–${short(price.savingsLikely)}`, strong: true, tone: "signal" },
        { label: "Return on cost", hint: "Savings ÷ price, first year", cell: ({ price }) => `${times(price.savingsLow / price.total)}–${times(price.savingsLikely / price.total)}`, strong: true, tone: "ember" },
      ],
    },
  ];
}

export default function DeploymentPricing() {
  const [single, setSingle] = useState(true);
  const [format, setFormat] = useState<DeliveryFormat>(RECOMMENDED);
  const mode: DeploymentMode = single ? format : "mix";
  const plan = DEPLOYMENT_MODES[mode];
  const priced: Priced[] = DEPLOYMENT_TIERS.map((tier, index) => ({ tier, price: priceDeploymentTier(tier, index, mode) }));
  const mix = DEPLOYMENT_MODES.mix.belts;

  return (
    <div className="dp">
      <div className="dp-choose">
        <div className="dp-switch" role="radiogroup" aria-label="How your people learn">
          <button type="button" role="radio" aria-checked={single} onClick={() => setSingle(true)}><Icon name="single" />One format for everyone</button>
          <button type="button" role="radio" aria-checked={!single} onClick={() => setSingle(false)}><Icon name="mix" />{DEPLOYMENT_MODES.mix.name}</button>
        </div>

        {single ? (
          <div className="dp-formats" role="radiogroup" aria-label="Format, from the most live time to the least">
            {FORMATS.map((id) => (
              <Fragment key={id}>
                {STEP_GIVES_UP[id] && <span className="dp-step" aria-hidden><Icon name="arrow" size={18} /><small>{STEP_GIVES_UP[id]}</small></span>}
                <button type="button" role="radio" aria-checked={format === id} className="dp-format" data-recommended={id === RECOMMENDED || undefined} onClick={() => setFormat(id)}>
                  {id === RECOMMENDED && <span className="dp-format__badge">Recommended</span>}
                  <span className="dp-format__icon"><Icon name={id} size={26} /></span>
                  <strong>{DEPLOYMENT_MODES[id].name}</strong>
                  <span>{DEPLOYMENT_MODES[id].tagline}</span>
                  <span className="dp-format__saving" data-full={id === "onsite" || undefined}>{id === "onsite" ? "Full price" : `Up to ${pct(SAVING_VS_ONSITE[id])} less`}</span>
                </button>
              </Fragment>
            ))}
          </div>
        ) : (
          <ul className="dp-chips" aria-label="How the mix delivers each belt">
            <li><Icon name={mix.yellow} />White and Yellow Belt <span>{FORMAT_WORD[mix.yellow]}</span></li>
            <li><Icon name={mix.green} />Green Belt <span>{FORMAT_WORD[mix.green]}</span></li>
            <li><Icon name={mix.black} />Black Belt <span>{FORMAT_WORD[mix.black]}</span></li>
          </ul>
        )}
      </div>

      <div className="dp-scroll" tabIndex={0} role="region" aria-label={`Deployment tiers compared, ${plan.name.toLowerCase()}`}>
        <table className="dp-table">
          <caption className="sr-only">Deployment tiers for {plan.name.toLowerCase()}: what each includes, its yearly price and estimated savings</caption>
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
          {sectionsFor(mode).map((section) => (
            <tbody key={section.title}>
              <tr className="dp-section"><th scope="colgroup" colSpan={priced.length + 1}><span>{section.title}</span></th></tr>
              {section.rows.map((row) => (
                <tr key={row.label} data-strong={row.strong || undefined} data-tone={row.tone}>
                  <th scope="row"><span>{row.label}</span>{row.hint && <small>{row.hint}</small>}</th>
                  {priced.map((column) => <td key={column.tier.id}>{row.cell(column)}</td>)}
                </tr>
              ))}
            </tbody>
          ))}
          <tfoot>
            <tr>
              <td />
              {priced.map(({ tier }, index) => (
                <td key={tier.id}>
                  <TrackedLink href="/contact?interest=training" eventOffer={`deployment ${tier.name} ${mode}`} className="k-btn k-btn--ghost dp-cta">
                    {index === priced.length - 1 ? "Talk to us" : "Plan this tier"}
                  </TrackedLink>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <section className="dp-credits" aria-labelledby="dp-credits-title">
        <header>
          <p className="k-mono k-mono--ember">More places when you need them</p>
          <h2 id="dp-credits-title">Belt credits</h2>
          <p>Every tier includes up to its listed places. When more of your people want to go further, buy belt credits and spend them on any belt. One credit is R1,000, and a place costs its list price.</p>
        </header>
        <div className="dp-credits__grid">
          <table className="dp-credits__belts">
            <caption className="sr-only">Credits per belt place</caption>
            <thead><tr><th scope="col">One place</th><th scope="col">Credits</th></tr></thead>
            <tbody>
              {BELT_CREDITS.map((b) => (
                <tr key={b.belt}>
                  <th scope="row"><span>{b.belt}</span><small>{b.format} · {b.note}</small></th>
                  <td className="k-num">{String(+beltCredits(b.price).toFixed(2))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="dp-credits__packs" aria-label="Credit packs">
            {CREDIT_PACKS.map((pack) => (
              <li key={pack.name}>
                <span className="k-mono">{pack.name}</span>
                <strong className="k-num">{short(pack.price)}</strong>
                <span>{fmt(packCredits(pack))} credits</span>
                <small>{pack.bonus ? `${pct(pack.bonus)} bonus` : "No bonus"}</small>
              </li>
            ))}
          </ul>
        </div>
        <p className="dp-note">Credits last for the contract year and roll over once. Each tier&apos;s included places are used first. Higher belts still need their prerequisites: a Green Belt place needs a project with a sponsor.</p>
      </section>

      <p className="dp-note">
        Built from our published pre-paid belt prices for each format (Green Belt, for example, is {rand(BELT_PRICES.online.green)} online, {rand(BELT_PRICES.virtual.green)} live virtual and {rand(BELT_PRICES.onsite.green)} on-site), coaching at {rand(COACHING_DAY_RATE)} a day and a Sigmafy licence per delegate. Ex VAT, billed monthly on an annual term. Your final quote follows a scoping call.
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
