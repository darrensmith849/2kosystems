import type { Metadata } from "next";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import { RATES, TIMEBOX, TERMS } from "@/lib/pricing";

/**
 * The websites landing page.
 *
 * Different market from the systems work and deliberately a different page.
 * Systems buyers are operations people with a three-month cycle; this one is a
 * business owner deciding inside a week. So: the price is the headline, the
 * group's track record does the trust work, and there is one thing to click.
 */

/**
 * Taken from the group's own client list. VERIFY THIS BEFORE THE PAGE GOES
 * LIVE — it is the single strongest claim here and the first thing a sceptical
 * buyer will test.
 */
const COMPANIES = "1,300+";
const SINCE = 2001;

export const metadata: Metadata = {
  title: "Websites — Built by 2KO. Priced Up Front.",
  description: `Business websites from ${RATES.siteLaunch}, live in ${TIMEBOX.siteLaunch}. Designed and built by the group that has delivered for ${COMPANIES} South African companies. Prices published, no discovery call needed.`,
  alternates: { canonical: "/websites" },
};

const TIERS = [
  {
    name: "Launch",
    price: RATES.siteLaunch,
    time: TIMEBOX.siteLaunch,
    line: "One page that does the job properly.",
    for: "Trades, consultants, single-service businesses — anyone whose customers just need to find them, believe them, and call them.",
    has: [
      "A single, long-scrolling page",
      "Written for you, not templated",
      "Mobile-first — most of your traffic is a phone",
      "Contact form and click-to-call",
      "Google Business Profile connected",
      "Live on your own domain",
    ],
  },
  {
    name: "Business",
    price: RATES.siteBusiness,
    time: TIMEBOX.siteBusiness,
    line: "The site most companies actually need.",
    for: "Established businesses with services to explain, a team to introduce and work to show. The version people expect when they look you up.",
    has: [
      "Up to eight pages",
      "Custom design — not a bought theme",
      "You edit the content yourself",
      "Built to be found: speed, structure, schema",
      "Enquiry routing to the right inbox",
      "Analytics that report on enquiries, not hits",
    ],
    featured: true,
  },
  {
    name: "Bespoke",
    price: `from ${RATES.siteBespokeFrom}`,
    time: TIMEBOX.siteBespoke,
    line: "When the site has to do something.",
    for: "Booking, member areas, quoting, portals, integrations. Where the website stops being a brochure and starts being part of how the business runs.",
    has: [
      "Everything in Business",
      "Custom functionality, scoped in week one",
      "Integrations with what you already run",
      "Roles and secure logins",
      "Built by the team that builds our systems",
      "Quoted against a written scope, fixed after that",
    ],
  },
];

const EVERY = [
  ["Yours outright", "Design, code, content and domain. No platform holding it hostage, no licence to keep paying."],
  ["Written properly", "We write the copy. You will not be sent a template with LOREM IPSUM where your business should be."],
  ["Fast, because it matters", "Half your visitors leave a slow page. Speed is a build decision, not an add-on."],
  ["Findable", "Structure, metadata and a sitemap Google can read. Not an SEO retainer — just doing it right the first time."],
  ["Accessible and legal", "Readable contrast, keyboard navigation, a privacy policy that reflects what the site actually does under POPIA."],
  ["Handed over", "Logins, documentation and a walkthrough. You are never locked out of your own website."],
];

const CARE = [
  {
    name: "Care",
    price: RATES.careBasic,
    line: "Keeps the site up, current and safe.",
    has: ["Hosting, domain and SSL", "Security patching and uptime monitoring", "Daily backups you can actually restore from", "Small text and image changes", "A human who answers"],
  },
  {
    name: "Care+",
    price: RATES.carePlus,
    line: "The above, plus someone actually working on it.",
    has: ["Everything in Care", "An hour of changes each month", "New pages and sections as you need them", "A monthly note on what people did on the site", "First call on our build time"],
  },
];

const QA = [
  {
    q: "Why is your price on the page when nobody else's is?",
    a: "Because hiding it wastes your time and ours. A published price means you can decide whether to talk to us before you have sat through a discovery call. If a quote has to be worked out — Bespoke — we say so and tell you what moves it.",
  },
  {
    q: `Live in ${TIMEBOX.siteLaunch}? Really?`,
    a: `For Launch, yes, provided you get us the content. The build is the fast part; waiting for your logo and your photographs is what usually takes a month. Business is ${TIMEBOX.siteBusiness}, Bespoke is ${TIMEBOX.siteBespoke} and up.`,
  },
  {
    q: "What if it costs more than the price you published?",
    a: `It does not. The price is fixed against the scope agreed in week one, and if we estimate badly that is ours to absorb. The only thing that moves it is you adding scope, quoted at ${RATES.dayRate} a day and agreed in writing before anyone starts.`,
  },
  {
    q: "Who are you, exactly?",
    a: `2KO has been trading since ${SINCE} and has delivered work for ${COMPANIES} South African companies — training, IT, and systems. The websites come out of the same group, which means the person building your site is not a freelancer who might stop answering in March.`,
  },
  {
    q: "We already have a website. It is just old.",
    a: "That is most of the work we do. Tell us the address. We will tell you honestly whether it needs rebuilding or just fixing, and if it is the second one we will say so even though it is worth less to us.",
  },
  {
    q: "Do we have to take a care plan?",
    a: `No. The site is yours and you can host it wherever you like. Most people take one because somebody has to patch it, back it up and answer the phone when something breaks — but it is a separate decision from the build, and ${TERMS.postLaunchSupportDays} days of support come with every project regardless.`,
  },
];

export default function WebsitesPage() {
  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="k-hero-web">
        <div className="k-web-aurora" aria-hidden />
        <div className="k-shell k-hero-web-inner">
          <Rise>
            <p className="k-mono k-mono--ember">2KO GROUP · WEBSITES</p>
          </Rise>
          <Rise step={1}>
            <h1 className="k-web-h1">The website your business should have had three years ago.</h1>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-web-lead">
              Designed and built by the group that has delivered for {COMPANIES} South African
              companies since {SINCE}. Prices published below. Nothing to sit through first.
            </p>
          </Rise>
          <Rise step={3}>
            <div className="k-web-cta">
              <Link href="#pricing" className="k-btn k-btn--solid">
                See the prices
              </Link>
              <Link href="/contact" className="k-btn k-btn--ghost">
                Send us your current site
              </Link>
            </div>
          </Rise>
          <Rise step={3}>
            <div className="k-web-facts">
              <div>
                <strong>{COMPANIES}</strong>
                <span>companies served</span>
              </div>
              <div>
                <strong>{new Date().getFullYear() - SINCE}+</strong>
                <span>years trading</span>
              </div>
              <div>
                <strong>{RATES.siteLaunch}</strong>
                <span>to start</span>
              </div>
              <div>
                <strong>{TIMEBOX.siteLaunch}</strong>
                <span>to live</span>
              </div>
            </div>
          </Rise>
        </div>
      </section>

      {/* ------------------------------------------------------- pricing */}
      <section id="pricing" className="k-band">
        <div className="k-shell">
          <Rise>
            <p className="k-mono">01 — WHAT IT COSTS</p>
            <h2 className="k-title k-web-h2">Three ways in. All of them priced.</h2>
            <p className="k-lead k-measure">
              Ex VAT, fixed against the scope agreed in week one. If your job does not fit one of
              these, we will tell you which one it is closest to and what the difference costs.
            </p>
          </Rise>

          <div className="k-web-tiers">
            {TIERS.map((t, i) => (
              <Rise key={t.name} step={(i + 1) as 1 | 2 | 3}>
                <article className={`k-web-tier${t.featured ? " k-web-tier--lead" : ""}`}>
                  {t.featured && <span className="k-web-flag">Most businesses</span>}
                  <h3 className="k-web-tier-name">{t.name}</h3>
                  <p className="k-web-price">{t.price}</p>
                  <p className="k-web-time">{t.time} · ex VAT</p>
                  <p className="k-web-tier-line">{t.line}</p>
                  <p className="k-sm k-web-tier-for">{t.for}</p>
                  <ul className="k-web-list">
                    {t.has.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </article>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- included */}
      <section className="k-band k-band--panel">
        <div className="k-shell">
          <Rise>
            <p className="k-mono">02 — IN EVERY BUILD</p>
            <h2 className="k-title k-web-h2">The parts nobody quotes for.</h2>
          </Rise>
          <div className="k-web-grid">
            {EVERY.map((e, i) => (
              <Rise key={e[0]} step={((i % 3) + 1) as 1 | 2 | 3}>
                <div className="k-web-cell">
                  <h3 className="k-sub">{e[0]}</h3>
                  <p className="k-sm">{e[1]}</p>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- care */}
      <section className="k-band">
        <div className="k-shell">
          <Rise>
            <p className="k-mono">03 — AFTERWARDS</p>
            <h2 className="k-title k-web-h2">Someone has to keep it running.</h2>
            <p className="k-lead k-measure">
              A website is not a thing you finish. It is a thing that needs patching, backing up
              and occasionally changing. Optional, monthly, cancel whenever.
            </p>
          </Rise>
          <div className="k-web-care">
            {CARE.map((c, i) => (
              <Rise key={c.name} step={(i + 1) as 1 | 2}>
                <article className="k-web-careplan">
                  <div className="k-web-careplan-head">
                    <h3 className="k-web-tier-name">{c.name}</h3>
                    <p className="k-web-price k-web-price--sm">
                      {c.price}
                      <span> /month</span>
                    </p>
                  </div>
                  <p className="k-web-tier-line">{c.line}</p>
                  <ul className="k-web-list">
                    {c.has.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </article>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- q&a */}
      <section className="k-band k-band--panel">
        <div className="k-shell">
          <Rise>
            <p className="k-mono">04 — THE OBVIOUS QUESTIONS</p>
            <h2 className="k-title k-web-h2">Asked and answered.</h2>
          </Rise>
          <div className="k-web-qa">
            {QA.map((item, i) => (
              <Rise key={item.q} step={((i % 3) + 1) as 1 | 2 | 3}>
                <div className="k-web-qa-item">
                  <h3 className="k-sub">{item.q}</h3>
                  <p className="k-sm">{item.a}</p>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- cta */}
      <section className="k-band k-web-close">
        <div className="k-shell">
          <Rise>
            <h2 className="k-state k-web-close-h">
              Send us the address of your current site.
            </h2>
            <p className="k-lead k-measure">
              We will look at it and tell you what we would actually do — including if the answer
              is &ldquo;less than you think&rdquo;. No call required to get that.
            </p>
            <div className="k-web-cta">
              <Link href="/contact" className="k-btn k-btn--solid">
                Start a project
              </Link>
              <Link href="/quote" className="k-btn k-btn--ghost">
                Build a scope yourself
              </Link>
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
