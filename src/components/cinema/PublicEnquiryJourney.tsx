"use client";

import { useState } from "react";
import Link from "next/link";

const outcomes = {
  review: {
    number: "01",
    title: "Process Review",
    qualifier: "The constraint is unclear",
    body: "Follow one live process and identify the smallest responsible next step.",
    href: "/process-review",
    cta: "See the Process Review",
  },
  audit: {
    number: "02",
    title: "Opportunity Audit",
    qualifier: "The investment needs evidence",
    body: "Quantify the strongest opportunities before committing to implementation.",
    href: "/audit",
    cta: "See the Audit",
  },
  direct: {
    number: "03",
    title: "Direct scope",
    qualifier: "The requirement is already clear",
    body: "Validate the boundary and move directly to a product, pilot or build scope.",
    href: "/systems",
    cta: "Explore Systems",
  },
  capability: {
    number: "04",
    title: "Training or Sigmafy",
    qualifier: "Capability or analysis is the constraint",
    body: "Shape the right cohort, learning path, statistical tools and application model.",
    href: "/training",
    cta: "Explore Capability",
  },
  partnership: {
    number: "05",
    title: "Improvement partnership",
    qualifier: "Several workstreams need sustained capacity",
    body: "Qualify the sponsorship, portfolio and operating cadence for an annual programme.",
    href: "/managed-improvement",
    cta: "See Partnerships",
  },
  stop: {
    number: "06",
    title: "No intervention",
    qualifier: "The evidence does not justify the work",
    body: "We may recommend an existing product, a readiness step, a referral—or doing nothing.",
    href: "/method",
    cta: "Read Our Method",
  },
} as const;

type OutcomeKey = keyof typeof outcomes;

export default function PublicEnquiryJourney() {
  const [active, setActive] = useState<OutcomeKey>("review");
  const outcome = outcomes[active];

  return (
    <figure className="eq-journey" aria-label="Interactive guide to what happens after a 2KO enquiry">
      <header className="eq-topbar">
        <span className="eq-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>YOUR ENQUIRY · THE RIGHT NEXT STEP</span>
        <span className="eq-human"><i /> READ BY A PERSON</span>
      </header>

      <div className="eq-flow">
        <article><span>01 · SEND</span><i className="eq-envelope" aria-hidden="true">↗</i><h3>Describe the symptom.</h3><p>No polished requirements document is needed.</p></article>
        <article><span>02 · UNDERSTAND</span><i className="eq-lens" aria-hidden="true" /><h3>We test what is known.</h3><p>Problem, ownership, evidence, value and readiness.</p></article>
        <article><span>03 · DECIDE</span><i className="eq-fork" aria-hidden="true"><b /><b /><b /></i><h3>Choose the smallest useful move.</h3><p>The enquiry branches according to the evidence.</p></article>
      </div>

      <div className="eq-outcomes">
        <nav aria-label="Possible outcomes after an enquiry">
          {(Object.keys(outcomes) as OutcomeKey[]).map((key) => {
            const item = outcomes[key];
            return (
              <button key={key} type="button" data-active={active === key} onClick={() => setActive(key)}>
                <span>{item.number}</span><div><strong>{item.title}</strong><small>{item.qualifier}</small></div><i>→</i>
              </button>
            );
          })}
        </nav>

        <article className="eq-decision">
          <span>ONE POSSIBLE NEXT STEP · {outcome.number}</span>
          <div className="eq-decision-mark" aria-hidden="true"><i /><i /><b>{outcome.number}</b></div>
          <h3>{outcome.title}</h3>
          <strong>{outcome.qualifier}</strong>
          <p>{outcome.body}</p>
          <Link href={outcome.href}>{outcome.cta} <i>→</i></Link>
        </article>
      </div>

      <figcaption><span>THERE IS NO AUTOMATIC SALES SEQUENCE.</span><span>THE RIGHT ANSWER MAY BE NOT TO BUILD ANYTHING.</span></figcaption>
    </figure>
  );
}
