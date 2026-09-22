import Link from "next/link";

const branches = [
  { side: "right", number: "01", question: "The requirement is already clear", title: "Direct scope", body: "Validate the boundary and move to the appropriate product, pilot or build.", href: "/systems" },
  { side: "left", number: "02", question: "One process can answer the decision", title: "Process Review", body: "Follow the live work and identify the smallest responsible next step.", href: "/process-review" },
  { side: "right", number: "03", question: "The investment needs broader evidence", title: "Opportunity Audit", body: "Quantify and prioritise the strongest opportunities before implementation.", href: "/audit" },
  { side: "left", number: "04", question: "Capability or analysis is the constraint", title: "Training or Sigmafy", body: "Shape the learning, statistical tools and workplace application required.", href: "/training" },
  { side: "right", number: "05", question: "Several workstreams need sustained capacity", title: "Improvement partnership", body: "Qualify the sponsorship, portfolio and annual operating cadence.", href: "/managed-improvement" },
  { side: "left", number: "06", question: "Intervention is not justified", title: "No build", body: "Use an existing product, establish readiness, accept a referral—or do nothing.", href: "/method" },
] as const;

export default function PublicEnquiryDecisionTree() {
  return (
    <figure className="eqd-chart" aria-label="Vertical decision tree showing what may happen after a 2KO enquiry">
      <header className="eqd-topbar"><span className="eqd-dots" aria-hidden="true"><i /><i /><i /></span><span>YOUR ENQUIRY · A HUMAN DECISION PATH</span><span className="eqd-live"><i /> TYPICAL, NOT RIGID</span></header>

      <div className="eqd-tree">
        <section className="eqd-start"><span>START</span><h3>Tell us where the work keeps going wrong.</h3><p>A short process description is enough.</p></section>
        <div className="eqd-arrow"><i>↓</i><span>READ BY A PERSON</span></div>
        <section className="eqd-gate"><span>THE QUALIFICATION QUESTION</span><h2>What is the smallest responsible decision we can help you make?</h2><div><i>Problem</i><i>Owner</i><i>Evidence</i><i>Value</i><i>Readiness</i></div></section>

        <div className="eqd-spine" aria-hidden="true"><span>THE ROUTE CHANGES WITH THE EVIDENCE</span></div>

        <div className="eqd-branches">
          {branches.map((branch) => (
            <section key={branch.number} className="eqd-branch" data-side={branch.side}>
              <article><span>{branch.number} · IF</span><strong>{branch.question}</strong><h3>{branch.title}</h3><p>{branch.body}</p><Link href={branch.href}>Explore this route <i>→</i></Link></article>
              <div className="eqd-node"><i>{branch.number}</i><b /></div>
            </section>
          ))}
        </div>

        <div className="eqd-arrow eqd-arrow--final"><i>↓</i><span>AGREE THE NEXT STEP—or agree to stop</span></div>
        <section className="eqd-end"><span>ONE CONTROLLED HANDOVER</span><h3>Problem understood. Owner named. Next decision clear.</h3><p>The route may change as evidence improves. That is judgement—not process failure.</p><a href="#process-brief">Send the process brief <i>↓</i></a></section>
      </div>

      <figcaption><span>NO AUTOMATIC SALES SEQUENCE.</span><span>THE RIGHT ANSWER MAY BE NOT TO BUILD ANYTHING.</span></figcaption>
    </figure>
  );
}
