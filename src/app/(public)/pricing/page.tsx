import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import CTASection from "@/components/CTASection";
import RevealOnScroll from "@/components/RevealOnScroll";
import { RATES, TERMS, TIMEBOX } from "@/lib/pricing";
import {
  AuditIcon,
  ProcessIcon,
  SpreadsheetIcon,
  PilotIcon,
  BuildIcon,
  RetainerIcon,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Pricing — What Custom Software Costs in South Africa",
  description:
    `Published prices for custom operational systems in South Africa. Process reviews from ${RATES.review}, spreadsheet replacement at ${RATES.getOffExcel}, pilots from ${RATES.pilotFrom}, phased builds ${RATES.buildFrom}–${RATES.buildTo}, and managed retainers from ${RATES.retainerCare} a month. All ex VAT, all fixed scope.`,
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing | 2KO Systems",
    description:
      "Real numbers for custom systems work in South Africa — fixed scope, fixed price, published rather than quoted behind a contact form.",
  },
};

type Tier = {
  id: string;
  eyebrow: string;
  name: string;
  price: string;
  priceNote: string;
  timebox: string;
  summary: string;
  bestFor: string;
  icon: ReactNode;
  href?: string;
  hrefLabel?: string;
  featured?: boolean;
};

const tiers: Tier[] = [
  {
    id: "review",
    eyebrow: "Start here if you are not sure",
    name: "Half-Day Process Review",
    price: RATES.review,
    priceNote: "fixed · credited against whatever you commission next",
    timebox: TIMEBOX.review,
    summary:
      "Half a day on site with the people who do the work, and a three-to-four page memo naming what is actually broken and what it would take to fix it.",
    bestFor:
      "You know something is wrong but cannot yet describe it as a project.",
    icon: <ProcessIcon size={22} />,
  },
  {
    id: "audit",
    eyebrow: "The diagnosis",
    name: "Systems Opportunity Audit",
    price: RATES.audit,
    priceNote: `fixed · credited in full against a pilot commissioned within ${TERMS.auditCreditDays} days`,
    timebox: TIMEBOX.audit,
    summary:
      "A day of fieldwork across at least two levels of your operation, then an eight-to-fourteen page report: three findings, each costed with the arithmetic shown, and one named pilot with a fixed price. Written to survive being forwarded without us in the room.",
    bestFor:
      "You want the problem quantified before you commit budget to building anything.",
    icon: <AuditIcon size={22} />,
    featured: true,
  },
  {
    id: "get-off-excel",
    eyebrow: "Productised",
    name: "Get Off Excel",
    price: RATES.getOffExcel,
    priceNote: "fixed · one spreadsheet · scope published in full",
    timebox: TIMEBOX.getOffExcel,
    summary:
      "The spreadsheet your operation depends on, rebuilt as a secure multi-user system with roles, validation, an audit trail and reporting. Your data migrated, your team trained, the code handed to you.",
    bestFor:
      "One clearly-defined process that has outgrown a shared file.",
    icon: <SpreadsheetIcon size={22} />,
    href: "/get-off-excel",
    hrefLabel: "See the full scope",
  },
  {
    id: "pilot",
    eyebrow: "Prove it works",
    name: "Proof-of-Value Pilot",
    price: `from ${RATES.pilotFrom}`,
    priceNote: "fixed against an agreed scope · nothing is throwaway",
    timebox: TIMEBOX.pilot,
    summary:
      "One workflow, built properly, with success criteria agreed in writing before we start. Weekly demos, working software from week two, and the pilot rolls forward into the larger build rather than being rebuilt.",
    bestFor:
      "A real operational problem where the integration or the workflow carries genuine risk.",
    icon: <PilotIcon size={22} />,
  },
  {
    id: "build",
    eyebrow: "The system itself",
    name: "Core System Build",
    price: `${RATES.buildFrom} – ${RATES.buildTo}`,
    priceNote: `fixed price per phase · ${TIMEBOX.buildPhase}`,
    timebox: "Phased",
    summary:
      "The full operational layer, delivered in phases. Each phase is quoted as a fixed price only once the previous one has shipped, so you are never asked to commit to a number for work nobody can scope yet.",
    bestFor:
      "Replacing a fragmented set of tools with one system the operation runs on.",
    icon: <BuildIcon size={22} />,
  },
  {
    id: "retainer",
    eyebrow: "Keep it alive",
    name: "Managed Intelligence Retainer",
    price: `${RATES.retainerCare} – ${RATES.retainerPartner}`,
    priceNote: `per month · ${TERMS.retainerMinMonths}-month minimum, then month-to-month`,
    timebox: "Ongoing",
    summary:
      "Hosting, monitoring, backups, patching and an SLA — plus included development time on the upper tiers for the improvements every live system needs.",
    bestFor:
      "Any system that matters enough that nobody wants to be the person maintaining it.",
    icon: <RetainerIcon size={22} />,
    href: "#retainers",
    hrefLabel: "Compare the three tiers",
  },
];

const retainerTiers = [
  {
    name: "Care",
    price: RATES.retainerCare,
    tagline: "Keep it running.",
    rows: ["Next business day", "—", "—", "—"],
  },
  {
    name: "Improve",
    price: RATES.retainerImprove,
    tagline: "Keep it improving.",
    rows: ["Same day", "~2 days / month", "Quarterly", "—"],
    featured: true,
  },
  {
    name: "Partner",
    price: RATES.retainerPartner,
    tagline: "Own the roadmap with us.",
    rows: ["4 hours", "~5 days / month", "Quarterly", "Included"],
  },
];

const retainerRowLabels = [
  "Support response SLA",
  "Included development time",
  "Operations review",
  "Roadmap ownership",
];

const principles = [
  {
    title: "Fixed price, never hourly",
    detail:
      "An hourly rate moves our estimation risk onto you, and you have no way to audit it. Every engagement on this page is a fixed price against a scope written down before work starts. If we estimated badly, that is ours to absorb.",
  },
  {
    title: "The pilot costs less than the problem",
    detail:
      `We hold ourselves to a ratio: a pilot should cost under ${TERMS.pilotValueRatio} of the annual value of the problem it fixes, and the audit shows the arithmetic so you can check. If a finding is too small to clear that, we will tell you not to build anything.`,
  },
  {
    title: "You own everything",
    detail:
      "Source code, documentation and data are yours from day one, built on mainstream technology any competent developer can pick up. There is no proprietary platform and no lock-in — if you ever want to leave, you can.",
  },
  {
    title: "Scope changes are quoted before they happen",
    detail:
      `Anything outside the agreed scope is priced at ${RATES.dayRate} per day (${RATES.hourlyRate} per hour for small pieces) and approved by you in writing before a line of it gets built. Never applied retrospectively, never discovered on an invoice.`,
  },
];

const termRows = [
  {
    term: "Payment schedule",
    detail:
      "Reviews, audits and Get Off Excel: 50% on signature, 50% on delivery. Pilots: 40% on signature, 40% at the mid-point demo, 20% on acceptance. Core builds: monthly against phase milestones.",
  },
  {
    term: "Retainer commitment",
    detail: `${TERMS.retainerMinMonths}-month minimum, then month-to-month. Pay twelve months up front and take ${TERMS.annualPrepayDiscount} off. Unused development days roll forward one month only.`,
  },
  {
    term: "Annual escalation",
    detail: `Retainers escalate at ${TERMS.escalation} on the anniversary, written into the agreement so it is never a conversation.`,
  },
  {
    term: "AI usage and third-party licences",
    detail: `Billed through separately at cost plus ${TERMS.passthroughMargin}, itemised on the invoice. We never fold them into a fixed price, because neither of us can predict them honestly.`,
  },
  {
    term: "VAT",
    detail:
      "Every figure on this page is quoted excluding VAT. Quotes and invoices show it separately.",
  },
];

const faqs = [
  {
    q: "Why publish prices at all?",
    a: "Because almost nobody in this market does, and the silence costs everyone time. If our numbers are wrong for you, you should find that out in ninety seconds on a web page rather than after three meetings and a proposal. Everyone who contacts us having read this page already knows what things cost.",
  },
  {
    q: "Can we pay monthly instead of up front?",
    a: "Yes. Any Core System Build can be structured as capital expenditure — a fixed price billed against milestones — or as a monthly figure over 24 months that includes the Care retainer, with ownership transferring at the end of the term. The monthly route totals more, because we carry the cost and the risk across those two years. It also tends to move faster, since a monthly operating figure usually sits below the approval threshold that would otherwise send the decision upstairs.",
  },
  {
    q: "What is not included in any of these numbers?",
    a: `Hosting and third-party licences after the first month, AI usage, and travel outside Gauteng and the Western Cape. All of it is itemised before you sign, never discovered afterwards.`,
  },
  {
    q: "Do you work with businesses smaller than this?",
    a: `The Half-Day Process Review at ${RATES.review} is deliberately priced so that almost any operation can start there, and plenty of them end up needing something far smaller than a system. If off-the-shelf software already solves your problem, we will say so — we would rather lose the sale than build you something you did not need.`,
  },
  {
    q: "What if the audit says we should not build anything?",
    a: "Then that is what it says, and you have saved several hundred thousand rand for the price of a day and a half of fieldwork. An audit that could only ever recommend buying software from us would not be worth commissioning.",
  },
  {
    q: "How do you handle our data?",
    a: "Access is role-based, changes are logged, and personal information is handled on a need-to-know basis. We will tell you before you sign exactly where your data will be hosted, and if your policy requires it to stay in South Africa we host it accordingly.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        eyebrow="Pricing"
        title="Every price, published. No call required."
        description="Real numbers, published. Every engagement below is a fixed price against a scope agreed in writing before work starts — no hourly billing, no discovery invoices, and nothing you have to book a call to find out."
        primaryCTA="Book a free scoping call"
        primaryHref="/contact"
        secondaryCTA="See the engagement model"
        secondaryHref="/how-we-work"
      />

      {/* WHY PUBLISHED */}
      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
        <div className="mx-auto max-w-3xl px-6 pt-20 text-center lg:px-10">
          <RevealOnScroll>
            <p
              className="font-semibold text-[var(--color-fg)]"
              style={{
                fontSize: "var(--text-headline)",
                letterSpacing: "var(--tracking-tight)",
                lineHeight: 1.5,
              }}
            >
              Most firms in this market will not quote you a number until you have
              sat through two meetings.
            </p>
            <p className="mt-5 text-[15px] leading-relaxed text-[var(--color-fg-muted)]">
              We think that wastes your time and ours. Below is the full ladder, from
              a half-day review to a phased system build, with the terms that go with
              each one. Every figure is ex VAT and every one of them is a fixed price,
              not a starting point.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* THE LADDER */}
      <section className="bg-[var(--color-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {tiers.map((tier, index) => (
              <RevealOnScroll key={tier.id} delay={index * 70} className="h-full">
                <div
                  id={tier.id}
                  className={`card-sweep relative flex h-full scroll-mt-24 flex-col overflow-hidden rounded-2xl border p-7 md:p-9 ${
                    tier.featured
                      ? "border-[var(--accent-border)]"
                      : "border-[var(--color-border)]"
                  } bg-[var(--color-surface)]`}
                  style={{
                    boxShadow: tier.featured
                      ? "var(--shadow-glow-accent)"
                      : "var(--shadow-card)",
                  }}
                >
                  {tier.featured && (
                    <div
                      className="pointer-events-none absolute inset-0"
                      aria-hidden="true"
                      style={{
                        background:
                          "radial-gradient(110% 60% at 100% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 65%)",
                      }}
                    />
                  )}

                  <div className="relative flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className="text-[11px] font-semibold uppercase text-[var(--accent)]"
                        style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                      >
                        {tier.eyebrow}
                      </span>
                      <span
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--accent)]"
                        style={{
                          background:
                            "color-mix(in srgb, var(--accent) 10%, transparent)",
                        }}
                      >
                        {tier.icon}
                      </span>
                    </div>

                    <h2 className="mt-4 text-[20px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
                      {tier.name}
                    </h2>

                    <p
                      className="mt-4 font-semibold tabular-nums text-[var(--color-fg)]"
                      style={{
                        fontSize: "clamp(30px, 3.4vw, 40px)",
                        letterSpacing: "var(--tracking-display)",
                        lineHeight: 1,
                      }}
                    >
                      {tier.price}
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-fg-meta)]">
                      {tier.priceNote}
                    </p>

                    <p className="mt-5 text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                      {tier.summary}
                    </p>

                    <dl className="mt-6 flex flex-col gap-3 border-t border-[var(--color-border-subtle)] pt-5">
                      <div className="flex gap-3">
                        <dt className="w-24 shrink-0 text-[12px] font-semibold uppercase tracking-wide text-[var(--color-fg-meta)]">
                          Timebox
                        </dt>
                        <dd className="text-[13px] text-[var(--color-fg)]">
                          {tier.timebox}
                        </dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="w-24 shrink-0 text-[12px] font-semibold uppercase tracking-wide text-[var(--color-fg-meta)]">
                          Best for
                        </dt>
                        <dd className="text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
                          {tier.bestFor}
                        </dd>
                      </div>
                    </dl>

                    {tier.href && (
                      <div className="mt-6">
                        <Link
                          href={tier.href}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent2)]"
                        >
                          {tier.hrefLabel} &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* RETAINER COMPARISON */}
      <section
        id="retainers"
        className="scroll-mt-24 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-2)]"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <SectionHeader
            eyebrow="Managed retainers"
            title="Three ways to keep a live system healthy."
            description={`All three include hosting, monitoring, automated backups and security patching. ${TERMS.retainerMinMonths}-month minimum, then month-to-month — and none of them are a condition of anything we build.`}
          />

          <RevealOnScroll>
            <div className="overflow-x-auto">
              <div className="grid min-w-[720px] grid-cols-[1.2fr_repeat(3,1fr)] gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border-subtle)]">
                <div className="bg-[var(--color-surface)] p-6" />
                {retainerTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`p-6 ${tier.featured ? "bg-[var(--color-bg-tinted)]" : "bg-[var(--color-surface)]"}`}
                  >
                    <h3 className="text-[15px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
                      {tier.name}
                    </h3>
                    <p className="mt-1 text-[13px] text-[var(--color-fg-meta)]">
                      {tier.tagline}
                    </p>
                    <p className="mt-4 text-[26px] font-semibold tabular-nums tracking-[var(--tracking-display)] text-[var(--color-fg)]">
                      {tier.price}
                    </p>
                    <p className="text-[12px] text-[var(--color-fg-meta)]">
                      per month, ex VAT
                    </p>
                  </div>
                ))}

                {retainerRowLabels.map((label, rowIndex) => (
                  <Fragment key={label}>
                    <div className="bg-[var(--color-surface)] p-6 text-[13px] font-semibold text-[var(--color-fg)]">
                      {label}
                    </div>
                    {retainerTiers.map((tier) => (
                      <div
                        key={`${tier.name}-${label}`}
                        className={`p-6 text-[13px] tabular-nums ${
                          tier.rows[rowIndex] === "—"
                            ? "text-[var(--color-fg-meta)]"
                            : "text-[var(--color-fg)]"
                        } ${tier.featured ? "bg-[var(--color-bg-tinted)]" : "bg-[var(--color-surface)]"}`}
                      >
                        {tier.rows[rowIndex]}
                      </div>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          <p className="mt-6 text-center text-[13px] text-[var(--color-fg-meta)]">
            Pay twelve months up front and take {TERMS.annualPrepayDiscount} off. Unused
            development days roll forward one month.
          </p>
        </div>
      </section>

      {/* HOW WE PRICE */}
      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <SectionHeader
            eyebrow="How we price"
            title="Four rules we hold ourselves to."
            description="These are the reasons the numbers above can be published at all."
          />
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border-subtle)] md:grid-cols-2">
            {principles.map((principle, index) => (
              <div key={principle.title} className="bg-[var(--color-surface)] p-7 md:p-9">
                <span
                  className="text-[11px] font-semibold uppercase tabular-nums text-[var(--accent)]"
                  style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-[17px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
                  {principle.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                  {principle.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPEX VS OPEX */}
      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-2)]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <SectionHeader
            eyebrow="Two ways to pay for a build"
            title="Capital cost, or a monthly figure."
            description="The same system, structured to fit how your business actually approves spend. Illustrative only — your number comes from your scope."
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RevealOnScroll className="h-full">
              <div
                className="h-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 md:p-9"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <span
                  className="text-[11px] font-semibold uppercase text-[var(--color-fg-meta)]"
                  style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                >
                  Capital expenditure
                </span>
                <p className="mt-4 text-[32px] font-semibold tabular-nums tracking-[var(--tracking-display)] text-[var(--color-fg)]">
                  R420,000
                </p>
                <p className="mt-2 text-[13px] text-[var(--color-fg-meta)]">
                  fixed, billed against phase milestones
                </p>
                <ul className="mt-6 flex flex-col gap-3 text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                  <li>Lowest total cost.</li>
                  <li>You own the system outright on delivery.</li>
                  <li>Retainer optional and priced separately.</li>
                  <li>Usually needs capital approval before it can start.</li>
                </ul>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={120} className="h-full">
              <div
                className="h-full rounded-2xl border border-[var(--accent-border)] bg-[var(--color-surface)] p-7 md:p-9"
                style={{ boxShadow: "var(--shadow-glow-accent)" }}
              >
                <span
                  className="text-[11px] font-semibold uppercase text-[var(--accent)]"
                  style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                >
                  Operating expenditure
                </span>
                <p className="mt-4 text-[32px] font-semibold tabular-nums tracking-[var(--tracking-display)] text-[var(--color-fg)]">
                  R24,500
                  <span className="text-[16px] font-medium text-[var(--color-fg-meta)]">
                    {" "}
                    / month
                  </span>
                </p>
                <p className="mt-2 text-[13px] text-[var(--color-fg-meta)]">
                  over 24 months, Care retainer included
                </p>
                <ul className="mt-6 flex flex-col gap-3 text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                  <li>Nothing up front.</li>
                  <li>Hosting, support and maintenance bundled in.</li>
                  <li>Ownership transfers at the end of the term.</li>
                  <li>
                    Costs more in total — we carry the cost and the risk for two
                    years — but usually starts far sooner.
                  </li>
                </ul>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* TERMS */}
      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
          <SectionHeader
            eyebrow="The small print, in normal type"
            title="Terms that apply to everything above."
          />
          <dl className="flex flex-col gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border-subtle)]">
            {termRows.map((row) => (
              <div
                key={row.term}
                className="grid grid-cols-1 gap-2 bg-[var(--color-surface)] p-6 md:grid-cols-[200px_1fr] md:gap-6 md:p-8"
              >
                <dt className="text-[13px] font-semibold text-[var(--color-fg)]">
                  {row.term}
                </dt>
                <dd className="text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                  {row.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-2)]">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
          <SectionHeader
            eyebrow="Questions about money"
            title="The ones worth asking before you call."
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
        title="Know what it costs. Now find out what you need."
        description={`A scoping call is free and takes about thirty minutes. If the answer is that you should not build anything, we will say so.`}
        primaryCTA="Book a free scoping call"
        primaryHref="/contact"
        secondaryCTA="See how we work"
        secondaryHref="/how-we-work"
      />
    </>
  );
}
