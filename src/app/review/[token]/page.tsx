import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Rise from "@/components/cinema/Rise";
import { Panel, Readout, QueueRows, Pill } from "@/components/cinema/instruments";
import { getReview, reviewTotals, recommendation, rand, REVIEWS } from "@/lib/reviews";
import { RATES, TERMS } from "@/lib/pricing";

export function generateStaticParams() {
  return REVIEWS.map((r) => ({ token: r.token }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const review = getReview(token);
  if (!review) return { robots: { index: false, follow: false } };

  const t = reviewTotals(review);
  return {
    title: `${review.company} — improvement review`,
    description: `${t.projectCount} completed improvement projects, ${rand(t.total)} of costed value, and the ${t.manualCount} control plans that depend on someone remembering.`,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const review = getReview(token);
  if (!review) notFound();

  const t = reviewTotals(review);
  const rec = recommendation(review);

  return (
    <>
      {/* ═══ HERO — same opening as every other page ═══ */}
      <section className="relative isolate overflow-hidden pt-32 pb-16 lg:pt-40">
        <div className="k-glow -z-10" style={{ top: "20px" }} aria-hidden="true" />
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">
              Private review · {review.company} · {review.sponsor}
            </p>
          </Rise>
          <Rise step={1}>
            <h1 className="k-hero mt-6 max-w-[19ch]">
              You fixed {t.projectCount} things. {t.manualCount} rely on someone
              remembering.
            </h1>
          </Rise>
          <Rise step={2}>
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <p className="k-lead max-w-[54ch]">
                Your team&rsquo;s improvement projects, with one column added:
                what the control plan actually depends on. The rand figures are
                theirs — each was costed by the person who ran the project.
              </p>
              <div className="flex shrink-0 gap-3">
                <Link href="/contact" className="k-btn k-btn--solid">
                  Book the {RATES.review} review
                </Link>
                <Link href="#offer" className="k-btn k-btn--ghost">
                  What we&rsquo;re asking
                </Link>
              </div>
            </div>
          </Rise>

          {/* ─── The register, rendered as the console frame ─── */}
          <Rise step={3} className="relative mt-14">
            <div className="k-horizon" style={{ top: "-1px" }} aria-hidden="true" />
            <div className="k-app">
              <div className="k-app-bar">
                <div className="flex items-center gap-2">
                  <span className="k-app-dot" style={{ background: "#e5534b" }} />
                  <span className="k-app-dot" style={{ background: "#e8a33d" }} />
                  <span className="k-app-dot" style={{ background: "#3fb950" }} />
                </div>
                <span className="k-mono">
                  {review.company} · improvement register · {review.cohort}
                </span>
                <span className="k-mono hidden sm:inline">
                  {t.projectCount} projects
                </span>
              </div>

              {/* Headline tiles, same pattern as the homepage console */}
              <div className="flex border-b border-[var(--hair)]">
                <div className="k-tile">
                  <p className="k-mono">Costed by your team</p>
                  <p className="k-num mt-1 text-[20px] leading-none">{rand(t.total)}</p>
                </div>
                <div className="k-tile">
                  <p className="k-mono">Behind a manual control</p>
                  <p className="k-num mt-1 text-[20px] leading-none" style={{ color: "var(--ember)" }}>
                    {rand(t.atRisk)}
                  </p>
                </div>
                <div className="k-tile hidden sm:block">
                  <p className="k-mono">Of the total value</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="k-num text-[20px] leading-none" style={{ color: "var(--ember)" }}>
                      {t.pct}%
                    </span>
                    <div className="k-bar-track flex-1">
                      <div
                        className="k-bar-fill"
                        style={{ width: `${t.pct}%`, background: "var(--ember)" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="k-app-listhead">
                <span className="k-mono">Holds without attention?</span>
                <span className="k-mono tabular-nums">
                  {t.manualCount} of {t.projectCount} do not
                </span>
              </div>

              {/* Rows in the console's own row style */}
              <ul className="flex flex-col">
                {review.projects.map((p) => (
                  <li key={p.name}>
                    <div className="k-app-row" style={{ height: "auto", padding: "12px" }}>
                      <span
                        className="mt-[5px] inline-block h-[7px] w-[7px] shrink-0 rounded-full"
                        style={{
                          background: p.type === "manual" ? "var(--ember)" : "var(--signal)",
                        }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium">{p.name}</span>
                        <span className="k-mono mt-1 block">
                          {p.year} · {p.lead} · {p.control}
                        </span>
                      </span>
                      <span className="k-num hidden shrink-0 text-[14px] sm:inline">
                        {rand(p.value)}
                      </span>
                      <span className="hidden shrink-0 lg:inline">
                        {p.type === "manual" ? (
                          <Pill tone="warn">Needs a person</Pill>
                        ) : (
                          <Pill tone="good">Holds</Pill>
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Rise>

          <Rise className="mt-5">
            <p className="k-mono">
              Private to {review.company} · built only from projects your own team
              submitted · not indexed, not shared
            </p>
          </Rise>
        </div>
      </section>

      {/* ═══ THE OFFER ═══ */}
      <section id="offer" className="k-band k-band--2 scroll-mt-20">
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">01 — What we are asking for</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-6 max-w-[22ch]">
              {RATES.review}. Half a day. One question answered.
            </h2>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-measure mt-5">
              We come to site for half a day, pick one of the {t.manualCount}{" "}
              improvements that relies on a person, and watch how it runs today.
              Then we tell you one thing: whether the gain held, or quietly went
              away.
            </p>
          </Rise>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {[
              { label: "What it costs", value: RATES.review, note: "ex VAT. Fixed. Nothing else to approve.", tone: "neutral" as const },
              { label: "What it takes from you", value: "Half a day", note: "One site visit, a few of your people briefly.", tone: "neutral" as const },
              { label: "What you get back", value: "A 4-page memo", note: "Page one is the answer. The rest is evidence.", tone: "good" as const },
            ].map((c, i) => (
              <Rise key={c.label} step={(i % 3) as 0 | 1 | 2}>
                <Panel label={c.label}>
                  <Readout value={c.value} tone={c.tone} />
                  <p className="k-sm mt-3">{c.note}</p>
                </Panel>
              </Rise>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Rise>
              <Panel label="What this is" meta="Included">
                <ul className="flex flex-col gap-2.5">
                  {[
                    `A fixed ${RATES.review}, agreed before we arrive`,
                    "One process, watched end to end, in person",
                    "A written answer: it held, or it did not",
                    "Credited in full against anything you commission after",
                  ].map((i) => (
                    <li key={i} className="flex gap-2.5 text-[13px] leading-[1.5]">
                      <span style={{ color: "var(--signal)" }}>—</span>
                      <span style={{ color: "var(--warm-70)" }}>{i}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </Rise>
            <Rise step={1}>
              <Panel label="What this is not" meta="Excluded">
                <ul className="flex flex-col gap-2.5">
                  {[
                    "Not a proposal, and not a quote for software",
                    "Not a commitment to build anything, by either of us",
                    "Not a sales visit — you get the memo either way",
                    "Not open-ended: one price, one day, one answer",
                  ].map((i) => (
                    <li key={i} className="flex gap-2.5 text-[13px] leading-[1.5]">
                      <span style={{ color: "var(--warm-25)" }}>—</span>
                      <span style={{ color: "var(--warm-45)" }}>{i}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </Rise>
          </div>

          <Rise step={2} className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/contact" className="k-btn k-btn--solid">
              Book the {RATES.review} review
            </Link>
            <Link href="/method" className="k-btn k-btn--ghost">
              See exactly how it runs
            </Link>
          </Rise>
        </div>
      </section>

      {/* ═══ WHY NOT A BUILD ═══ */}
      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center">
          <div>
            <Rise>
              <p className="k-mono k-mono--ember">02 — Why we are not quoting you for software</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[24ch]">
                We do not know yet whether it is worth building.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-6">
                The obvious move would be to quote you for a system. We are not
                going to, because on our own published rule it does not yet add
                up — and we would rather show you the arithmetic than skip past
                it.
              </p>
            </Rise>
            <Rise step={3}>
              <p className="k-lead k-measure mt-5">
                Either that figure is understated, or this should not be automated
                at all. Half a day on site is how we find out, and that is a{" "}
                {RATES.review} question rather than a {RATES.pilotFrom} one.
              </p>
            </Rise>
          </div>

          <Rise step={1}>
            <Panel label="The arithmetic" meta="Check it yourself">
              <p className="k-mono">{t.largest.name}</p>
              <Readout value={rand(rec.problem)} unit="per year" tone="warn" />
              <div className="k-hairline mt-4 pt-3">
                <QueueRows
                  rows={[
                    { label: "Cheapest build we do", value: `from ${RATES.pilotFrom}` },
                    { label: "That is this much of a year", value: `${rec.pct}%`, tone: "warn" },
                    { label: "Our published ceiling", value: TERMS.pilotValueRatio, tone: "good" },
                    { label: "So a build must come under", value: rand(rec.maxJustifiable) },
                  ]}
                />
              </div>
              <div className="k-hairline mt-4 pt-3">
                <p className="k-mono">Costed by {t.largest.lead}, not by us.</p>
              </div>
            </Panel>
          </Rise>
        </div>
      </section>

      {/* ═══ CLOSE ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rise>
              <p className="k-mono">Next</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[22ch]">
                So: {RATES.review}, half a day, and you will know.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                That is the entire ask. If the improvements held, the memo says so
                and you have spent {RATES.review} to stop wondering. If they did
                not, you will know which one, what it is costing, and whether it
                is worth doing anything about.
              </p>
            </Rise>
          </div>
          <Rise step={3} className="flex flex-col gap-3">
            <Link href="/contact" className="k-btn k-btn--solid">
              Book the review
            </Link>
            <Link href="/method" className="k-btn k-btn--ghost">
              How we work
            </Link>
          </Rise>
        </div>
      </section>
    </>
  );
}
