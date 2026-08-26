import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Rise from "@/components/cinema/Rise";
import { Panel, QueueRows, Pill } from "@/components/cinema/instruments";
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
    // Private by definition. Never indexed, never followed.
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
      {/* ═══ OPENING ═══ */}
      <section className="relative isolate overflow-hidden pt-32 pb-14 lg:pt-40">
        <div className="k-glow -z-10" style={{ top: "20px" }} aria-hidden="true" />
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">
              Prepared for {review.sponsor} · {review.sponsorRole} · {review.company}
            </p>
          </Rise>
          <Rise step={1}>
            <h1 className="k-hero mt-6 max-w-[20ch]">
              Your team fixed {t.projectCount} things. {t.manualCount} of them
              depend on someone remembering.
            </h1>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-measure mt-6">
              These are the improvement projects your people completed through{" "}
              {review.cohort}. The numbers are theirs — each was costed by the
              person who ran the project. We added one column: what the control
              plan actually depends on.
            </p>
          </Rise>

          {/* The ask, stated before anyone has to scroll for it. */}
          <Rise step={3}>
            <div
              className="mt-8 inline-flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] border px-5 py-4"
              style={{ borderColor: "var(--signal)", background: "rgba(63,185,80,0.06)" }}
            >
              <span className="k-mono" style={{ color: "var(--signal)" }}>
                What we want
              </span>
              <span className="text-[15px]" style={{ color: "var(--warm)" }}>
                Half a day on site and {RATES.review} to tell you whether they
                held. That is the whole ask.
              </span>
            </div>
          </Rise>

          {/* Headline numbers */}
          <Rise step={3}>
            <div className="mt-12 grid gap-px overflow-hidden rounded-[10px] border border-[var(--hair)] sm:grid-cols-3">
              {[
                { label: "Costed by your team", value: rand(t.total), tone: "var(--warm)" },
                { label: "Behind a manual control", value: rand(t.atRisk), tone: "var(--ember)" },
                { label: "Of the total value", value: `${t.pct}%`, tone: "var(--ember)" },
              ].map((tile) => (
                <div key={tile.label} className="bg-[var(--panel)] p-6">
                  <p className="k-mono">{tile.label}</p>
                  <p className="k-num mt-2 text-[30px] leading-none" style={{ color: tile.tone }}>
                    {tile.value}
                  </p>
                </div>
              ))}
            </div>
          </Rise>
        </div>
      </section>

      {/* ═══ THE TABLE ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell">
          <Rise>
            <p className="k-mono">01 — Your projects</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-6 max-w-[26ch]">
              What each improvement is holding on to.
            </h2>
          </Rise>

          <Rise step={2} className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left">
              <thead>
                <tr>
                  {["Project", "Costed at", "Control method", "Holds without attention?"].map((h) => (
                    <th key={h} className="k-mono border-b border-[var(--hair)] pb-3 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {review.projects.map((p) => (
                  <tr key={p.name} style={{ borderBottom: "1px solid var(--hair)" }}>
                    <td className="py-5 pr-6 align-top">
                      <span className="text-[14px] font-medium tracking-[-0.015em]">{p.name}</span>
                      <span className="k-mono mt-1 block">
                        {p.year} · {p.lead}
                      </span>
                    </td>
                    <td className="k-num py-5 pr-6 align-top text-[15px]">{rand(p.value)}</td>
                    <td className="py-5 pr-6 align-top">
                      <span className="text-[13px]" style={{ color: "var(--warm-70)" }}>
                        {p.control}
                      </span>
                      <span className="k-mono mt-1.5 block" style={{ color: "var(--warm-45)" }}>
                        {p.note}
                      </span>
                    </td>
                    <td className="py-5 align-top">
                      {p.type === "manual" ? (
                        <Pill tone="warn">Needs a person</Pill>
                      ) : (
                        <Pill tone="good">Holds on its own</Pill>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Rise>
        </div>
      </section>

      {/* ═══ THE OFFER — the loudest thing on the page ═══ */}
      <section className="k-band">
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">02 — What we are asking for</p>
          </Rise>

          <Rise step={1}>
            <div
              className="mt-8 overflow-hidden rounded-[12px] border"
              style={{ borderColor: "var(--signal)", background: "rgba(63,185,80,0.05)" }}
            >
              <div className="p-7 lg:p-10">
                <p className="k-mono">The whole offer</p>

                <h2 className="k-state mt-4 max-w-[22ch]">
                  {t.reviewPrice}. Half a day. One question answered.
                </h2>

                <p className="k-lead mt-6 max-w-[58ch]">
                  We come to site for half a day. We pick one of the{" "}
                  {t.manualCount} improvements above that relies on a person, and
                  we watch how it actually runs today. Then we tell you one thing:
                  whether the gain held, or quietly went away.
                </p>

                <div className="mt-9 grid gap-px overflow-hidden rounded-[10px] border border-[var(--hair)] md:grid-cols-3">
                  {[
                    {
                      label: "What it costs",
                      value: t.reviewPrice,
                      note: "ex VAT. Fixed. Nothing else to approve.",
                      tone: "var(--warm)",
                    },
                    {
                      label: "What it takes from you",
                      value: "Half a day",
                      note: "One site visit. A few of your people, briefly.",
                      tone: "var(--warm)",
                    },
                    {
                      label: "What you get back",
                      value: "A 4-page memo",
                      note: "Page one is the answer. The rest is the evidence.",
                      tone: "var(--signal)",
                    },
                  ].map((c) => (
                    <div key={c.label} className="bg-[var(--panel)] p-6">
                      <p className="k-mono">{c.label}</p>
                      <p className="k-num mt-2 text-[26px] leading-none" style={{ color: c.tone }}>
                        {c.value}
                      </p>
                      <p className="k-sm mt-2.5">{c.note}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-9 grid gap-8 md:grid-cols-2">
                  <div>
                    <p className="k-mono" style={{ color: "var(--signal)" }}>
                      What this is
                    </p>
                    <ul className="mt-3 flex flex-col gap-2.5">
                      {[
                        `A fixed ${t.reviewPrice}, agreed before we arrive`,
                        "One process, watched end to end, in person",
                        "A written answer: it held, or it did not",
                        "Credited in full against anything you commission after it",
                      ].map((i) => (
                        <li key={i} className="flex gap-2.5 text-[13.5px] leading-[1.5]">
                          <span style={{ color: "var(--signal)" }}>—</span>
                          <span style={{ color: "var(--warm-70)" }}>{i}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="k-mono" style={{ color: "var(--ember)" }}>
                      What this is not
                    </p>
                    <ul className="mt-3 flex flex-col gap-2.5">
                      {[
                        "Not a proposal, and not a quote for software",
                        "Not a commitment to build anything, by either of us",
                        "Not a sales visit — you get the memo either way",
                        "Not open-ended: one price, one day, one answer",
                      ].map((i) => (
                        <li key={i} className="flex gap-2.5 text-[13.5px] leading-[1.5]">
                          <span style={{ color: "var(--ember)" }}>—</span>
                          <span style={{ color: "var(--warm-70)" }}>{i}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link href="/contact" className="k-btn k-btn--solid">
                    Book the {t.reviewPrice} review
                  </Link>
                  <Link href="/method" className="k-btn k-btn--ghost">
                    See exactly how it runs
                  </Link>
                </div>
              </div>
            </div>
          </Rise>
        </div>
      </section>

      {/* ═══ WHY NOT A BUILD ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <div>
            <Rise>
              <p className="k-mono k-mono--ember">03 — Why we are not quoting you for software</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[24ch]">
                We do not know yet whether it is worth building.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-6">
                The obvious move here would be to quote you for a system. We are
                not going to, because on our own published rule it does not yet
                add up — and we would rather show you the arithmetic than skip it.
              </p>
            </Rise>
            <Rise step={3}>
              <p className="k-lead k-measure mt-5">
                Your largest exposure is {rand(rec.problem)} a year. The cheapest
                build we do starts at {RATES.pilotFrom}, which is {rec.pct}% of
                one year&rsquo;s cost. We only propose a build under{" "}
                {TERMS.pilotValueRatio}. So either that number is understated, or
                this should not be automated at all. Half a day on site is how we
                find out — and it is a {t.reviewPrice} question, not a{" "}
                {RATES.pilotFrom} one.
              </p>
            </Rise>
          </div>

          <Rise step={1}>
            <Panel label="The arithmetic" meta="Check it yourself">
              <QueueRows
                rows={[
                  { label: "Costing you, per year", value: rand(rec.problem), tone: "warn" },
                  { label: "Cheapest build we do", value: `from ${RATES.pilotFrom}` },
                  { label: "That is this much of a year", value: `${rec.pct}%`, tone: "warn" },
                  { label: "Our published ceiling", value: TERMS.pilotValueRatio, tone: "good" },
                  { label: "So a build must come in under", value: rand(rec.maxJustifiable) },
                ]}
              />
              <div className="k-hairline mt-4 pt-3">
                <p className="k-mono">
                  That figure was costed by {t.largest.lead}, not by us.
                </p>
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
              <h2 className="k-title mt-6 max-w-[24ch]">
                So: {t.reviewPrice}, half a day, and you will know.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                That is the entire ask. If the improvements held, the memo says so
                and you have spent {t.reviewPrice} to stop wondering. If they did
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

        <div className="k-shell mt-12">
          <p className="k-mono">
            Private to {review.company}. Not indexed, not shared, and built only
            from projects your own team submitted.
          </p>
        </div>
      </section>
    </>
  );
}
