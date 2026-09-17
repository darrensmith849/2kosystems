import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import Link from "next/link";
import PhaseArtefact from "@/components/cinema/PhaseArtefact";
import Photo from "@/components/cinema/Photo";
import Rise from "@/components/cinema/Rise";
import TrackedLink from "@/components/cinema/TrackedLink";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import { RATES, TIMEBOX } from "@/lib/pricing";

export const metadata: Metadata = completePageMetadata({
  title: "Half-Day Process Review — R7,500",
  description:
    "Walk one operational process end to end with 2KO and receive a concise diagnosis, build-or-do-not-build recommendation and the right next step.",
  alternates: { canonical: "/process-review" },
});

const useWhen = [
  "People describe the same process differently.",
  "The work moves through several disconnected tools.",
  "Waiting and chasing appear larger than the work itself.",
  "A control depends on a checklist, spreadsheet or supervisor memory.",
  "The team is asking for technology before the process is understood.",
  "An earlier improvement is beginning to decay.",
];

const recommendations = [
  ["Process", "Improve the process before doing anything else"],
  ["People", "Train or coach the team"],
  ["Automation", "Automate a bounded workflow"],
  ["System", "Replace or build a system"],
  ["Evidence", "Investigate through a fuller audit"],
  ["Product", "Use an existing off-the-shelf product"],
  ["Stop", "Do not build anything"],
];

export default function ProcessReviewPage() {
  return (
    <>
      <ServiceJsonLd
        name="Half-Day Process Review"
        description="One operational process walked end to end, followed by a concise diagnosis and build-or-do-not-build recommendation."
        path="/process-review"
        price="7500"
        duration={TIMEBOX.review}
      />

      <section className="pr-hero">
        <div className="pr-hero-media" aria-hidden="true">
          <Photo src="/imagery/process-review/hero-v2.webp" priority sizes="100vw" position="center" />
        </div>
        <div className="pr-hero-shade" aria-hidden="true" />
        <div className="k-shell pr-hero-inner">
          <div className="pr-hero-copy">
            <Rise><p className="k-mono k-mono--ember">HALF-DAY PROCESS REVIEW</p></Rise>
            <Rise step={1}><h1>See the work <span>before changing it.</span></h1></Rise>
            <Rise step={2}><p className="pr-hero-lead">We follow one live process with the people who perform it and the person who owns the result. Then we tell you whether the right move is improvement, training, automation, a system—or nothing at all.</p></Rise>
            <Rise step={3} className="pr-hero-actions">
              <TrackedLink href="/contact?interest=process-review" eventOffer="process review" className="k-btn k-btn--solid">Book a Process Review</TrackedLink>
              <Link href="#review-memo" className="k-btn k-btn--ghost">See what you receive</Link>
            </Rise>
          </div>
          <Rise step={3} className="pr-hero-facts">
            <span><b>{RATES.review}</b><small>ex VAT · fixed</small></span>
            <span><b>{TIMEBOX.review}</b><small>on site</small></span>
            <span><b>One</b><small>live process</small></span>
            <span><b>Credited</b><small>against the next engagement</small></span>
          </Rise>
        </div>
      </section>

      <section id="review-memo" className="k-band k-band--2 overflow-hidden">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,.62fr)_minmax(520px,1fr)] lg:items-center">
          <div>
            <Rise><p className="k-mono k-mono--ember">THE DECISION ARTEFACT</p></Rise>
            <Rise step={1}><h2 className="k-title mt-7 max-w-[16ch]">A short memo that names what the process needs next.</h2></Rise>
            <Rise step={2}><p className="k-lead mt-7 max-w-[44ch]">The fieldwork becomes a bounded recommendation—not a workshop transcript or a sales proposal disguised as diagnosis.</p></Rise>
          </div>
          <Rise step={2}>
            <PhaseArtefact kind="memo" />
            <p className="k-mono mt-4">Illustrative review memo · example process and recommendation</p>
          </Rise>
        </div>
      </section>

      <section className="relative isolate flex min-h-[96svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/process-review/handoff-v1.webp" priority sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/20 to-black/55" aria-hidden="true" />
        <div className="k-shell grid gap-12 pb-20 pt-40 lg:grid-cols-[minmax(0,.8fr)_minmax(420px,1fr)] lg:items-end">
          <div>
            <Rise><p className="k-mono k-mono--ember">01 — When to use it</p></Rise>
            <Rise step={1}><h2 className="k-state mt-8 max-w-[15ch]">You can see the symptoms. You cannot yet name the constraint.</h2></Rise>
          </div>
          <Rise step={2}>
            <ol className="overflow-hidden rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl">
              {useWhen.map((item, index) => (
                <li key={item} className="grid grid-cols-[38px_1fr] gap-4 border-b border-white/10 px-6 py-4 last:border-b-0">
                  <span className="k-mono k-mono--ember">0{index + 1}</span>
                  <span className="k-sm text-[var(--warm-70)]">{item}</span>
                </li>
              ))}
            </ol>
          </Rise>
        </div>
      </section>

      <section className="k-band overflow-hidden">
        <div className="k-shell">
          <Rise><p className="k-mono k-mono--ember">02 — What happens</p></Rise>
          <Rise step={1}><h2 className="k-title mt-8 max-w-[22ch]">One process, followed from the instruction to the evidence.</h2></Rise>

          <div className="relative mt-16 grid gap-12 lg:grid-cols-3 lg:gap-0">
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-[var(--ember)] via-[var(--signal)] to-[var(--info)] lg:block" aria-hidden="true" />
            {[
              ["Before", "Bound it", "We agree the process, site, participants and explicit exclusions. You provide the artefacts used to run the work—not a presentation about it."],
              ["During", "Walk it", "We follow the process with somebody who performs it and somebody who owns the outcome. We record handoffs, waiting, workarounds and controls."],
              ["After", "Name it", "You receive a three-to-four-page memo naming the principal failure, its likely impact and the smallest appropriate next step."],
            ].map(([phase, title, body], index) => (
              <Rise key={phase} step={index as 0 | 1 | 2}>
                <article className="relative border-t border-[var(--hair-2)] pt-12 lg:border-0 lg:pr-12">
                  <span className="absolute -top-[7px] left-0 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--hair-2)] bg-[var(--black)] k-num text-[18px] lg:top-0">0{index + 1}</span>
                  <p className="k-mono mt-4 lg:mt-12">{phase}</p>
                  <h3 className="k-state mt-5">{title}</h3>
                  <p className="k-sm mt-5 max-w-[38ch]">{body}</p>
                </article>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section className="k-band k-band--2 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 top-0 text-[clamp(120px,24vw,360px)] font-semibold leading-none tracking-[-.09em] text-white/[.018]" aria-hidden="true">DECIDE</div>
        <div className="k-shell relative grid gap-14 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Rise><p className="k-mono">03 — The recommendation</p></Rise>
            <Rise step={1}><h2 className="k-state mt-8 max-w-[14ch]">The answer is not required to be technology.</h2></Rise>
            <Rise step={2}><p className="k-lead mt-8 max-w-[42ch]">The memo names the smallest intervention that fits the evidence—even when the best answer is to stop without building.</p></Rise>
          </div>
          <div>
            {recommendations.map(([signal, item], index) => (
              <Rise key={signal} step={(index % 3) as 0 | 1 | 2}>
                <article className="group grid grid-cols-[44px_minmax(0,.7fr)_minmax(0,1fr)] items-baseline gap-5 border-t border-[var(--hair)] py-6">
                  <span className="k-mono k-mono--ember">0{index + 1}</span>
                  <strong className="text-[clamp(22px,3vw,42px)] font-medium leading-none tracking-[-.045em] text-white/20 transition-colors duration-500 group-hover:text-[var(--ember)]">{signal}</strong>
                  <p className="k-sm">{item}</p>
                </article>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate flex min-h-[88svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/process-review/decision-v1.webp" sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/55 via-transparent to-black/25" aria-hidden="true" />
        <div className="k-shell grid gap-10 pb-20 pt-44 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
          <div>
            <Rise><p className="k-mono k-mono--ember">04 — A bounded decision</p></Rise>
            <Rise step={1}><h2 className="k-state mt-8 max-w-[14ch]">One process. One site. No open-ended discovery.</h2></Rise>
            <Rise step={2}><p className="k-lead mt-8 max-w-[50ch]">The review includes up to four primary participants. It does not include a detailed financial model, technical architecture, prototype or implementation scope.</p></Rise>
          </div>
          <Rise step={2}>
            <aside className="rounded-2xl border border-white/10 bg-black/75 p-7 shadow-2xl backdrop-blur-xl">
              <p className="k-mono k-mono--ember">Fixed price</p>
              <p className="k-num mt-6 text-[clamp(44px,6vw,72px)] leading-none">{RATES.review}</p>
              <p className="k-sm mt-4">Ex VAT. Credited against the next engagement under the published terms.</p>
              <TrackedLink href="/contact?interest=process-review" eventOffer="process review" className="k-btn k-btn--solid mt-7 w-full">Book a Process Review</TrackedLink>
              <Link href="/audit" className="k-link mt-6">Need quantified findings?</Link>
            </aside>
          </Rise>
        </div>
      </section>
    </>
  );
}
