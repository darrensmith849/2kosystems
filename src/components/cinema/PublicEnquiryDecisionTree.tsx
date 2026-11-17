import Link from "next/link";

const branches = [
  { side: "right", number: "01", question: "You know the numbers and the belts", title: "Plan the waves", body: "Agree the cohorts, the order of the belts and the first projects.", href: "/training" },
  { side: "left", number: "02", question: "You want proof before you scale", title: "Pilot cohort", body: "One Green Belt cohort on real projects, measured, before the wider rollout.", href: "/training" },
  { side: "right", number: "03", question: "Everyone needs the basics", title: "White Belt for everyone", body: "Every employee on Sigmafy, with certificates and your own progress dashboards.", href: "/sigmafy" },
  { side: "left", number: "04", question: "Leaders need to see the results", title: "Programme on Sigmafy", body: "Projects, sign-offs and savings against a baseline, visible to the people paying for it.", href: "/sigmafy" },
  { side: "right", number: "05", question: "Several business units are involved", title: "Improvement partnership", body: "Qualify the sponsorship, the portfolio and the annual cadence.", href: "/managed-improvement" },
  { side: "left", number: "06", question: "Training is not the answer", title: "We will say so", body: "If the problem is not capability, we tell you, and point you to what is.", href: "/method" },
] as const;

export default function PublicEnquiryDecisionTree() {
  return (
    <figure className="eqd-chart" aria-label="Vertical decision tree showing what may happen after a 2KO enquiry">
      <header className="eqd-topbar"><span className="eqd-dots" aria-hidden="true"><i /><i /><i /></span><span>YOUR ENQUIRY · A HUMAN DECISION PATH</span><span className="eqd-live"><i /> TYPICAL, NOT RIGID</span></header>

      <div className="eqd-tree">
        <section className="eqd-start"><span>START</span><h3>Tell us how many people you want to develop.</h3><p>A rough number and the belts in mind are enough.</p></section>
        <div className="eqd-arrow"><i>↓</i><span>READ BY A PERSON</span></div>
        <section className="eqd-gate"><span>THE QUALIFICATION QUESTION</span><h2>What is the smallest programme that can prove the result?</h2><div><i>People</i><i>Belts</i><i>Projects</i><i>Sponsor</i><i>Evidence</i></div></section>

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
        <section className="eqd-end"><span>ONE CONTROLLED HANDOVER</span><h3>People counted. Sponsor named. First cohort clear.</h3><p>The route may change as evidence improves. That is judgement—not process failure.</p><a href="#process-brief">Send us the brief <i>↓</i></a></section>
      </div>

      <figcaption><span>NO AUTOMATIC SALES SEQUENCE.</span><span>THE RIGHT ANSWER MAY BE A SMALLER PILOT.</span></figcaption>
    </figure>
  );
}
