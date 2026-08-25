import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";
import StepProcess from "@/components/StepProcess";
import CTASection from "@/components/CTASection";
import RevealOnScroll from "@/components/RevealOnScroll";
import { RATES, TERMS, TIMEBOX as TIMEBOXES } from "@/lib/pricing";
import {
  SpreadsheetIcon,
  ApprovalIcon,
  DashboardIcon,
  PortalIcon,
  AdminIcon,
  ScopeIcon,
  PrototypeIcon,
  BuildIcon,
  OptimiseIcon,
} from "@/components/Icons";

/**
 * Every figure on this page comes from the shared pricing module, so this
 * page and /pricing can never quote different numbers.
 */
const PRICE = RATES.getOffExcel;
const PRICE_NUMERIC = "79500";
const TIMEBOX = TIMEBOXES.getOffExcel;
const DAY_RATE = RATES.dayRate;
const PILOT_FROM = RATES.pilotFrom;
const REVIEW_PRICE = RATES.review;

export const metadata: Metadata = {
  title: "Get Off Excel — Replace Your Spreadsheet With a Real System",
  description:
    `Replace the spreadsheet your operation runs on with a proper multi-user system in ${TIMEBOX}. Fixed price ${PRICE} ex VAT, fixed scope, fixed date. Built in South Africa for South African operations.`,
  alternates: { canonical: "/get-off-excel" },
  openGraph: {
    title: "Get Off Excel | 2KO Systems",
    description:
      `The spreadsheet your business depends on, rebuilt as a real system in ${TIMEBOX}. Fixed price ${PRICE} ex VAT.`,
  },
};

/** The symptoms people actually type into Google before they find this page. */
type Symptom = { title: string; description: string };

const symptoms: Symptom[] = [
  {
    title: "“Locked for editing by another user”",
    description:
      "Two people need the file at once and one of them has to wait, ask, or work in a copy that will never be merged back.",
  },
  {
    title: "Someone overwrote the master",
    description:
      "A week of captures gone, and no way to tell what changed, when, or who did it. The backup is a copy on somebody's desktop.",
  },
  {
    title: "Final_v3_USE_THIS_ONE.xlsx",
    description:
      "Nobody is certain which file is current. Decisions get made off whichever version was attached to the last email.",
  },
  {
    title: "The formula broke and nobody knows why",
    description:
      "The person who built it left. The logic lives in nested formulas across four sheets and one hidden tab nobody opens.",
  },
  {
    title: "It only works on one person's laptop",
    description:
      "A macro, a plugin, or a mapped drive means one machine can run it. When they are on leave, the process stops.",
  },
  {
    title: "Month-end is three days of copy-paste",
    description:
      "The same numbers rekeyed into the same report every month, with a fresh chance to fat-finger a figure each time.",
  },
];

/** Hard scope box. This is the page's scope defence — it stays specific. */
const included: string[] = [
  "One spreadsheet (or one tightly-related set) rebuilt as a web-based system",
  "Secure login, with up to three roles — for example capturer, approver, viewer",
  "Proper multi-user access: everyone works in the same live data, at the same time",
  "Your existing data migrated across and reconciled against the source",
  "Validation rules so bad data cannot be captured in the first place",
  "Full audit trail — who changed what, when, and what the previous value was",
  "One standard report set, plus CSV and Excel export whenever you need it",
  "Automated daily or weekly backups",
  "Hosting configured and running, with the system live on your own domain",
  "Training for your team, and a written handover document",
  "Source code and documentation handed to you — you own all of it",
  `${TERMS.postLaunchSupportDays} days of post-launch support for fixes and questions`,
];

const excluded: string[] = [
  "Integrations with Sage, Pastel, Syspro, Xero or any other third-party system",
  "More than three user roles, or a custom permission matrix per person",
  "Mobile apps in the app stores (the system works in a phone browser)",
  "Migrating more than one spreadsheet or workflow",
  "AI features — drafting, classification, document Q&A",
  "Custom dashboards beyond the standard report set",
  "Data cleansing where the source data has to be rebuilt rather than moved",
  "Third-party licences and ongoing hosting costs after the first month",
];

const timeline = [
  {
    number: "01",
    title: "Week 1 — Capture",
    description:
      "We sit with the people who use the spreadsheet daily, walk the process end to end, and agree the scope in writing. You sign off the field list and the three roles before anything is built.",
    icon: <ScopeIcon size={18} />,
  },
  {
    number: "02",
    title: "Week 2 — Build",
    description:
      "The system takes shape against the agreed scope. You see a working version at the end of the week and use it with real data, not a mock-up.",
    icon: <PrototypeIcon size={18} />,
  },
  {
    number: "03",
    title: "Week 3 — Migrate",
    description:
      "Your existing data moves across and is reconciled line by line against the spreadsheet. Your team tests with their own records and we fix what they find.",
    icon: <BuildIcon size={18} />,
  },
  {
    number: "04",
    title: "Week 4 — Go live",
    description:
      "Training, handover documentation, backups configured, and the system live on your domain. The spreadsheet gets archived, not deleted — you keep it as a reference.",
    icon: <OptimiseIcon size={18} />,
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: `What if it takes longer than ${TIMEBOX}?`,
    a: `That is our risk, not yours. The price is fixed against the scope we agree in week one. If the build runs long because we estimated badly, we absorb it. The only thing that moves the price is you adding scope — and that is quoted at ${DAY_RATE} per day and approved by you in writing before any work starts.`,
  },
  {
    q: "Who owns the system and the code?",
    a: "You do, from day one. Source code, documentation and data are yours. We build on mainstream, widely-supported technology so any competent developer can pick it up — there is no proprietary platform holding your operation hostage.",
  },
  {
    q: "Where does our data live?",
    a: "In a region you choose, and we will tell you exactly where before you sign. We build with POPIA in mind: access is role-based, changes are logged, and personal information is handled on a need-to-know basis. If your policy requires the data to stay in South Africa, say so at scoping and we will host it accordingly.",
  },
  {
    q: "Can it talk to Sage, Pastel or Syspro later?",
    a: `Yes, and it is built so that it can — but not inside this product. An integration changes the shape and the risk of the work, so it belongs in a Proof-of-Value Pilot (from ${PILOT_FROM}). Getting off the spreadsheet first is still the right first move: it gives the integration something clean to connect to.`,
  },
  {
    q: `What happens after the ${TERMS.postLaunchSupportDays} days of support?`,
    a: "Nothing you have to buy. The system is built to run independently and you own everything needed to operate it. Most clients move onto a Managed Retainer for hosting, monitoring, backups and ongoing improvements, but it is a choice, not a condition.",
  },
  {
    q: "How do we know our spreadsheet fits the fixed price?",
    a: `We tell you before you pay anything. The scoping conversation is free, and if your process is bigger than this product we will say so rather than sell it to you. Where the picture is genuinely unclear, a ${REVIEW_PRICE} Half-Day Process Review settles it — and that fee comes off whatever you commission next.`,
  },
];

/** Product structured data — so search and AI answers can quote the real price. */
const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Get Off Excel — spreadsheet replacement system",
  description: `A fixed-price, fixed-scope engagement that replaces one business-critical spreadsheet with a secure multi-user web system in ${TIMEBOX}.`,
  brand: { "@type": "Brand", name: "2KO Systems" },
  offers: {
    "@type": "Offer",
    price: PRICE_NUMERIC,
    priceCurrency: "ZAR",
    availability: "https://schema.org/InStock",
    priceValidUntil: "2027-12-31",
    url: "https://www.2kosystems.com/get-off-excel",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function GetOffExcelPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PageHero
        eyebrow="Fixed price · Fixed scope · Fixed date"
        title="Everyone has the file. Nobody trusts it."
        description={`The file everyone shares, nobody trusts, and one person understands — rebuilt as a real multi-user system in ${TIMEBOX}. ${PRICE} ex VAT, agreed up front, with the scope written down before we start.`}
        primaryCTA="Book a free scoping call"
        primaryHref="/contact"
        secondaryCTA="See exactly what's included"
        secondaryHref="#whats-included"
      />

      {/* SYMPTOMS — mirrors the language people search with */}
      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <SectionHeader
            eyebrow="Sound familiar?"
            title="You are probably here because one of these happened this week."
            description="A spreadsheet is a brilliant tool right up to the day your operation outgrows it. These are the signs that the day has passed."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {symptoms.map((symptom, index) => (
              <RevealOnScroll key={symptom.title} delay={index * 70} className="h-full">
                <Card
                  icon={<SpreadsheetIcon size={22} />}
                  title={symptom.title}
                  description={symptom.description}
                />
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll delay={200}>
            <p className="mx-auto mt-12 max-w-2xl text-center text-[15px] leading-relaxed text-[var(--color-fg-muted)]">
              None of this is a discipline problem. It is a tooling problem — you are
              using a calculator as a database, and it has been holding on longer than
              it was ever designed to.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* THE PRICE — unmissable, with the terms right next to it */}
      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-2)]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <RevealOnScroll>
            <div
              className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 md:p-14"
              style={{ boxShadow: "var(--shadow-popover)" }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                  background:
                    "radial-gradient(100% 60% at 100% 0%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 65%)",
                }}
              />

              <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
                <div>
                  <span className="eyebrow-rule">The whole price</span>
                  <p
                    className="mt-5 font-semibold tabular-nums text-[var(--color-fg)]"
                    style={{
                      fontSize: "clamp(44px, 6vw, 72px)",
                      letterSpacing: "var(--tracking-display)",
                      lineHeight: 1,
                    }}
                  >
                    {PRICE}
                  </p>
                  <p className="mt-3 text-[15px] font-medium text-[var(--color-fg-muted)]">
                    ex VAT · {TIMEBOX} · one spreadsheet · no surprises
                  </p>
                  <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[var(--color-fg-muted)]">
                    Not an estimate, not a starting point, and not billed by the hour.
                    It is what the work costs, agreed before we begin. If we
                    under-estimated the build, that is ours to carry.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-7 py-3 text-[14px] font-semibold tracking-[-0.005em] text-white shadow-[0_8px_24px_-12px_rgba(22,163,74,0.55)] transition-all duration-200 hover:bg-[var(--accent2)] active:scale-[0.98]"
                    >
                      Book a free scoping call
                    </Link>
                    <Link
                      href="#whats-included"
                      className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-7 py-3 text-[14px] font-medium tracking-[-0.005em] text-[var(--color-fg)] transition-all duration-200 hover:bg-[var(--color-bg-2)] active:scale-[0.98]"
                    >
                      What&rsquo;s included
                    </Link>
                  </div>
                </div>

                <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border-subtle)]">
                  {[
                    {
                      term: "Payment terms",
                      detail:
                        "50% on signature, 50% on go-live. Nothing is due before the scope is written down and you have signed it off.",
                    },
                    {
                      term: "Scope changes",
                      detail: `Quoted at ${DAY_RATE} per day and approved by you in writing before any work starts. Never applied retrospectively.`,
                    },
                    {
                      term: "If it is bigger than this",
                      detail: `We say so at scoping instead of selling you the wrong product. That conversation costs nothing.`,
                    },
                  ].map((row) => (
                    <div key={row.term} className="bg-[var(--color-surface)] p-6">
                      <dt
                        className="text-[11px] font-semibold uppercase text-[var(--accent)]"
                        style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                      >
                        {row.term}
                      </dt>
                      <dd className="mt-2 text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                        {row.detail}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* SCOPE BOX — included vs not, same weight for both columns */}
      <section
        id="whats-included"
        className="scroll-mt-24 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <SectionHeader
            eyebrow="The scope box"
            title="Exactly what the price buys — and what it does not."
            description="Both lists are published in the same size type, because the second one is the reason the first one can be a fixed price."
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RevealOnScroll className="h-full">
              <div
                className="h-full rounded-2xl border border-[var(--accent-border)] bg-[var(--color-surface)] p-7 md:p-9"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <h3
                  className="text-[11px] font-semibold uppercase text-[var(--accent)]"
                  style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                >
                  Included in {PRICE}
                </h3>
                <ul className="mt-5 flex flex-col gap-3.5">
                  {included.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-[3px] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: "var(--accent)" }}
                      >
                        &#10003;
                      </span>
                      <span className="text-[14px] leading-relaxed text-[var(--color-fg)]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={120} className="h-full">
              <div
                className="h-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-2)] p-7 md:p-9"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <h3
                  className="text-[11px] font-semibold uppercase text-[var(--color-fg-meta)]"
                  style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                >
                  Not included — quoted separately
                </h3>
                <ul className="mt-5 flex flex-col gap-3.5">
                  {excluded.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-[3px] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-fg-meta)]"
                      >
                        &#8211;
                      </span>
                      <span className="text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-[var(--color-border-subtle)] pt-5 text-[13px] leading-relaxed text-[var(--color-fg-meta)]">
                  Anything on this list is real work we do — it just changes the shape
                  and the risk of the engagement, so it gets its own scope and its own
                  price rather than quietly eating this one.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-2)]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <SectionHeader
            eyebrow="The four weeks"
            title="What happens, week by week."
            description="You see working software in week two, not a slide deck in week six. Every week ends with something you can open and use."
          />
          <RevealOnScroll>
            <StepProcess steps={timeline} />
          </RevealOnScroll>
        </div>
      </section>

      {/* WHAT CHANGES — the outcome, in operational language */}
      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <SectionHeader
            eyebrow="After go-live"
            title="What actually changes on the Monday."
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <PortalIcon size={22} />,
                title: "Everyone works at once",
                description:
                  "No file locks, no copies, no merging. One live set of records the whole team can see and edit at the same time.",
              },
              {
                icon: <ApprovalIcon size={22} />,
                title: "Every change is attributable",
                description:
                  "Who changed what, when, and what it was before. The audit story writes itself as a side-effect of the work.",
              },
              {
                icon: <DashboardIcon size={22} />,
                title: "Reports come out on their own",
                description:
                  "The month-end pack stops being three days of copy-paste and becomes something you open when you want it.",
              },
              {
                icon: <AdminIcon size={22} />,
                title: "It survives people leaving",
                description:
                  "The logic is documented and the system is hosted, not stored on one laptop. Nobody's leave is an operational risk any more.",
              },
            ].map((item, index) => (
              <RevealOnScroll key={item.title} delay={index * 80} className="h-full">
                <Card
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                />
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* WHEN IT IS NOT RIGHT — qualifies out, and ladders up honestly */}
      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-2)]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <RevealOnScroll>
              <div>
                <span className="eyebrow-rule">Straight talk</span>
                <h2
                  className="mt-5 font-semibold text-[var(--color-fg)]"
                  style={{
                    fontSize: "var(--text-display-md)",
                    letterSpacing: "var(--tracking-display)",
                    lineHeight: 1.1,
                  }}
                >
                  When this is the wrong thing to buy.
                </h2>
                <p className="mt-5 text-[15px] leading-relaxed text-[var(--color-fg-muted)]">
                  A fixed price only stays honest if the product has edges. If your
                  situation is one of these, this is not the right purchase and we will
                  tell you on the call rather than after the invoice.
                </p>
                <Link
                  href="/how-we-work"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent2)]"
                >
                  See the full engagement model &rarr;
                </Link>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={120}>
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border-subtle)]">
                {[
                  {
                    title: "It has to talk to Sage, Pastel or Syspro",
                    detail: `That is a Proof-of-Value Pilot, from ${PILOT_FROM}. The integration is where the risk sits, and it deserves its own scope.`,
                  },
                  {
                    title: "It is four spreadsheets and a WhatsApp group",
                    detail: `More than one workflow means the problem is coordination, not capture. Start with a Systems Opportunity Audit and we will find the highest-value place to cut in.`,
                  },
                  {
                    title: "Nobody agrees what the process actually is",
                    detail: `Automating a disputed process just makes the dispute faster. A ${REVIEW_PRICE} Half-Day Process Review settles it first, and the fee comes off whatever you commission next.`,
                  },
                  {
                    title: "Off-the-shelf software already does this",
                    detail:
                      "If a standard product fits your operation, buy the standard product. We will say so — and we would rather lose the sale than build you something you did not need.",
                  },
                ].map((row) => (
                  <div key={row.title} className="bg-[var(--color-surface)] p-6">
                    <h3 className="text-[15px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
                      {row.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                      {row.detail}
                    </p>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
          <SectionHeader
            eyebrow="Questions we always get"
            title="The things worth asking before you sign anything."
          />
          <div className="flex flex-col gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border-subtle)]">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-[var(--color-surface)] p-6 md:p-8">
                <h3 className="text-[16px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
                  {faq.q}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Send us the spreadsheet. We will tell you what it takes."
        description={`A scoping call costs nothing and takes about thirty minutes. You will leave it knowing whether ${PRICE} covers your process — or what would.`}
        primaryCTA="Book a free scoping call"
        primaryHref="/contact"
        secondaryCTA="See how we work"
        secondaryHref="/how-we-work"
      />
    </>
  );
}
