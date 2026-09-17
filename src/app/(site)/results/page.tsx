import type { Metadata } from "next";
import Link from "next/link";
import ClientStrip from "@/components/cinema/ClientStrip";
import Photo from "@/components/cinema/Photo";
import Rise from "@/components/cinema/Rise";
import TrackedLink from "@/components/cinema/TrackedLink";
import { completePageMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = completePageMetadata({
  title: "Results & Process Improvement Outcomes",
  description:
    "See the cumulative impact 2KO has influenced, the operating outcomes we pursue and the evidence standard behind every result we publish.",
  alternates: { canonical: "/results" },
});

const outcomes = [
  {
    code: "01",
    eyebrow: "COST · QUALITY",
    title: "Less waste, rework and failure cost.",
    body: "We trace where value leaks from a process, remove the causes that matter and make the new way of working easier to hold.",
    measure: "COST PER CASE · REWORK · DEFECTS",
    image: "/imagery/sectors/services/accounting-v1.webp",
    position: "center",
    href: "/audit",
    link: "Find the opportunity",
  },
  {
    code: "02",
    eyebrow: "FLOW · CAPACITY",
    title: "Faster movement from request to result.",
    body: "Waiting, handoffs and unclear ownership become visible—then the process is redesigned around a cleaner path to completion.",
    measure: "LEAD TIME · BACKLOG · THROUGHPUT",
    image: "/imagery/sectors/services/customer-operations-v1.webp",
    position: "62% center",
    href: "/automation",
    link: "Explore automation",
  },
  {
    code: "03",
    eyebrow: "CONTROL · EVIDENCE",
    title: "Better control without more administration.",
    body: "Rules, authority and exceptions are built into the workflow so that the right person acts and the record survives afterwards.",
    measure: "EXCEPTIONS · COMPLIANCE · COVERAGE",
    image: "/imagery/sectors/manufacturing-v1.webp",
    position: "center",
    href: "/systems",
    link: "See operational systems",
  },
  {
    code: "04",
    eyebrow: "CAPABILITY · SUSTAINMENT",
    title: "Teams that keep improving after we leave.",
    body: "Training is connected to real work, real projects and operating measures—not treated as an isolated classroom event.",
    measure: "APPLICATION · ADOPTION · SUSTAINMENT",
    image: "/imagery/training/hero-v2.webp",
    position: "58% center",
    href: "/training",
    link: "Explore capability building",
  },
];

const evidenceGates = [
  ["Baseline", "The bounded process, measure, source and period before intervention."],
  ["Mechanism", "The constraint we found and what changed in the way the work operates."],
  ["Comparison", "The same definition and source applied after the change."],
  ["Sustained", "Evidence that the improvement held through a meaningful operating period."],
  ["Attribution", "Other contributing changes and the part 2KO can reasonably influence."],
  ["Permission", "The naming level, wording and evidence note approved for publication."],
];

export default function ResultsPage() {
  return (
    <div className="rs2-page">
      <section className="rs2-hero">
        <div className="rs2-hero-media" aria-hidden="true">
          <Photo src="/imagery/results/evidence-review-v1.webp" priority sizes="100vw" position="63% center" />
        </div>
        <div className="rs2-hero-shade" aria-hidden="true" />
        <div className="rs2-hero-grid" aria-hidden="true" />
        <div className="k-shell rs2-hero-inner">
          <Rise><p className="r-kicker">CUMULATIVE IMPACT · ACROSS THE 2KO GROUP</p></Rise>
          <Rise step={1}>
            <h1 className="rs2-hero-title">
              <span>$5bn+</span>
              <em>in combined client savings influenced.</em>
            </h1>
          </Rise>
          <Rise step={2}>
            <p className="rs2-hero-lead">A cumulative portfolio figure spanning process-improvement engagements and applied improvement programmes. Lasting outcomes are produced with client teams—not by 2KO alone.</p>
          </Rise>
          <Rise step={3} className="rs2-hero-actions">
            <TrackedLink href="/contact?interest=operational-excellence" eventOffer="measurable result" className="k-btn k-btn--solid">Discuss a measurable result</TrackedLink>
            <Link href="#evidence-standard" className="k-btn k-btn--ghost">See how we substantiate it</Link>
          </Rise>
          <Rise step={3} className="rs2-hero-facts">
            <span><b>Cumulative portfolio</b><small>Basis</small></span>
            <span><b>Shared contribution</b><small>Attribution</small></span>
            <span><b>Client-level confidential</b><small>Disclosure</small></span>
          </Rise>
        </div>
      </section>

      <ClientStrip />

      <section className="rs2-outcomes">
        <div className="k-shell">
          <div className="rs2-outcomes-head">
            <Rise><div><p className="r-kicker">WHAT THE WORK CHANGES</p><h2>The result depends on where value is leaking.</h2></div></Rise>
            <Rise step={1}><p>Not every engagement should produce the same headline. We agree the operating outcome first, then choose the process, training, automation, system and measurement work needed to move it.</p></Rise>
          </div>
          <div className="rs2-outcome-grid">
            {outcomes.map((outcome, index) => (
              <Rise key={outcome.code} step={(index % 3) as 0 | 1 | 2}>
                <article className="rs2-outcome-card">
                  <div className="rs2-outcome-media" aria-hidden="true"><Photo src={outcome.image} sizes="(min-width: 1024px) 55vw, 100vw" position={outcome.position} /></div>
                  <div className="rs2-outcome-shade" aria-hidden="true" />
                  <div className="rs2-outcome-top"><span>{outcome.code}</span><span>{outcome.eyebrow}</span></div>
                  <div className="rs2-outcome-copy">
                    <h3>{outcome.title}</h3>
                    <p>{outcome.body}</p>
                    <small>MEASURED THROUGH · {outcome.measure}</small>
                    <Link href={outcome.href}>{outcome.link} <span>→</span></Link>
                  </div>
                </article>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section className="rs2-bridge">
        <div className="rs2-bridge-media" aria-hidden="true"><Photo src="/imagery/sectors/services/multi-site-v1.webp" sizes="100vw" position="61% center" /></div>
        <div className="rs2-bridge-shade" aria-hidden="true" />
        <div className="k-shell rs2-bridge-inner">
          <Rise><p className="r-kicker">DIFFERENT SECTORS · THE SAME OPERATING QUESTIONS</p></Rise>
          <Rise step={1}><h2>Where is value waiting, leaking or disappearing?</h2></Rise>
          <Rise step={2}>
            <div className="rs2-question-line" aria-label="The four questions we ask">
              <span>What repeats?</span><span>What waits?</span><span>What fails?</span><span>What proves it?</span>
            </div>
          </Rise>
        </div>
      </section>

      <section id="evidence-standard" className="rs2-standard">
        <div className="k-shell rs2-standard-inner">
          <div className="rs2-standard-head">
            <Rise><p className="r-paper-kicker">THE EVIDENCE STANDARD</p><h2>A number earns its place here.</h2></Rise>
            <Rise step={1}><p>The result is the headline. This is the discipline underneath it. A public claim is held until the full chain is clear enough to survive operational, financial and client scrutiny.</p></Rise>
          </div>
          <div className="rs2-gates">
            {evidenceGates.map(([name, body], index) => (
              <Rise key={name} step={(index % 3) as 0 | 1 | 2}>
                <article><span>{String(index + 1).padStart(2, "0")}</span><h3>{name}</h3><p>{body}</p></article>
              </Rise>
            ))}
          </div>
          <Rise className="rs2-standard-note"><span>THE RULE</span><p>No baseline, no comparable measure and no defensible attribution means no public result claim.</p></Rise>
        </div>
      </section>

      <section className="rs2-close">
        <div className="rs2-close-media" aria-hidden="true"><Photo src="/imagery/managed-improvement/partnership-close-v1.webp" sizes="100vw" position="58% center" /></div>
        <div className="rs2-close-shade" aria-hidden="true" />
        <div className="k-shell rs2-close-inner">
          <Rise><p className="r-kicker">START WITH THE RESULT THAT MATTERS</p></Rise>
          <Rise step={1}><h2>Bring us one process worth changing.</h2></Rise>
          <Rise step={2}><p>Tell us what is slow, costly, unreliable or difficult to control. We will help you define the outcome, locate the constraint and decide whether improvement, training, automation, a system—or a combination—is the right next move.</p></Rise>
          <Rise step={3} className="rs2-close-actions">
            <TrackedLink href="/contact?interest=operational-excellence" eventOffer="results conversation" className="k-btn k-btn--solid">Start the conversation</TrackedLink>
            <Link href="/audit" className="k-btn k-btn--ghost">Begin with a Process Review</Link>
          </Rise>
        </div>
      </section>
    </div>
  );
}
