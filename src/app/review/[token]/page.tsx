import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Rise from "@/components/cinema/Rise";
import { Panel, QueueRows, Pill } from "@/components/cinema/instruments";
import { getReview, reviewTotals, rand, REVIEWS } from "@/lib/reviews";
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
              These are the improvement projects your people completed and
              submitted through {review.cohort}. The numbers are theirs, not ours
              — each one was costed by the person who ran the project and signed
              off by a sponsor. We have added one column: what the control plan
              actually depends on.
            </p>
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

      {/* ═══ THE ARGUMENT ═══ */}
      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <div>
            <Rise>
              <p className="k-mono k-mono--ember">02 — What we are actually saying</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[22ch]">
                None of this is a criticism of the work.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-6">
                The improvements were real and the numbers were defensible. What
                we are pointing at is the mechanism holding them in place. Two of
                your six went into a system and will still be true in three years.
                The other {t.manualCount} went onto a person — a weekly walk, a
                monthly review, a book countersigned at shift change.
              </p>
            </Rise>
            <Rise step={3}>
              <p className="k-lead k-measure mt-5">
                Those decay. Not because anyone stops caring, but because a
                resignation, a busy quarter or a new priority moves attention
                somewhere else. That is the normal outcome, and it is worth{" "}
                {rand(t.atRisk)} a year on this page alone.
              </p>
            </Rise>
          </div>

          <Rise step={1}>
            <Panel label="Largest exposure" meta="Your figures">
              <p className="k-mono">{t.largest.name}</p>
              <p className="k-num mt-3 text-[28px] leading-none" style={{ color: "var(--ember)" }}>
                {rand(t.largest.value)}
              </p>
              <p className="k-mono mt-2">per year, costed by {t.largest.lead}</p>
              <div className="k-hairline mt-4 pt-3">
                <QueueRows
                  rows={[
                    { label: "Current control", value: "Manual", tone: "warn" },
                    { label: "Pilot to make it automatic", value: `from ${RATES.pilotFrom}` },
                    {
                      label: "Share of one year's value",
                      value: `${Math.round((Number(RATES.pilotFrom.replace(/[^0-9]/g, "")) / t.largest.value) * 100)}%`,
                      tone: "good",
                    },
                    { label: "Our ceiling", value: TERMS.pilotValueRatio },
                  ]}
                />
              </div>
              <p className="k-mono mt-4">
                We only propose a build when it costs under{" "}
                {TERMS.pilotValueRatio} of the problem it fixes.
              </p>
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
                Half a day on site tells you which of these actually slipped.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                We walk one of them end to end and tell you whether the gain held.
                {" "}{t.reviewPrice} ex VAT, and the fee comes off whatever you
                commission next. If they all held, that is what the memo will say
                and you will have spent {t.reviewPrice} to know it.
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
