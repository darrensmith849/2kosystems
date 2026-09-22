import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import Link from "next/link";
import ClientStrip from "@/components/cinema/ClientStrip";
import Photo from "@/components/cinema/Photo";
import Rise from "@/components/cinema/Rise";
import TrackedLink from "@/components/cinema/TrackedLink";
import TrainingCommandCentre from "@/components/cinema/TrainingCommandCentre";
import { CourseFinder, TrainerReview } from "@/components/cinema/TrainingShowcase";

const TRAINING_SITE = "https://www.sixsigmasouthafrica.co.za/";

export const metadata: Metadata = completePageMetadata({
  title: "Six Sigma Training & Applied Capability Programmes",
  description: "2KO connects internationally accredited Six Sigma training with live improvement projects, coaching, measurement and operational systems across Africa.",
  alternates: { canonical: "/training" },
});

const pathways = [
  ["01", "White Belt", "Shared language", "A practical introduction to Six Sigma, its terminology and the DMAIC improvement method.", "https://www.sixsigmasouthafrica.co.za/courses/white-belt-online"],
  ["02", "Yellow Belt", "Team participation", "Equip operational teams to recognise waste, support analysis and contribute to structured improvement.", "https://www.sixsigmasouthafrica.co.za/courses/yellow-belt-classroom"],
  ["03", "Green Belt", "Project leadership", "Build the method and statistical confidence to lead small-to-medium improvement projects.", "https://www.sixsigmasouthafrica.co.za/courses/dmaic-green-belt-classroom"],
  ["04", "Black Belt", "Programme leadership", "Advanced analysis, change leadership and coaching for complex cross-functional improvement.", "https://www.sixsigmasouthafrica.co.za/courses/dmaic-black-belt-classroom"],
];

const programme = [
  ["Learn", "The method", "Accredited teaching creates a common improvement language and a disciplined way to investigate performance."],
  ["Apply", "The live project", "Each learner connects the method to a bounded operating priority with a baseline and accountable sponsor."],
  ["Coach", "The decision gates", "Practitioner coaching challenges the analysis, removes drift and keeps the work moving between modules."],
  ["Verify", "The operating benefit", "The result is traced to a source, reviewed with the sponsor and tested for sustainment—not inferred from attendance."],
];

export default function TrainingPage() {
  return (
    <>
      <section className="tr-hero">
        <div className="tr-hero-media" aria-hidden="true">
          <Photo
            src="/imagery/training/hero-v2.webp"
            priority
            sizes="100vw"
            position="66% center"
          />
        </div>
        <div className="tr-hero-shade" aria-hidden="true" />
        <div className="k-shell tr-hero-inner">
          <div className="tr-hero-copy">
            <Rise><p className="k-mono k-mono--ember">TRAIN · SIX SIGMA SOUTH AFRICA</p></Rise>
            <Rise step={1}><h1>Build people who can <span>improve the operation.</span></h1></Rise>
            <Rise step={2}><p className="tr-hero-lead">Internationally accredited Six Sigma training becomes more valuable when it stays connected to the work. 2KO can link learning, live projects, coaching, systems and benefit verification in one visible capability programme.</p></Rise>
            <Rise step={3} className="tr-hero-actions">
              <TrackedLink href={`${TRAINING_SITE}contact`} eventOffer="training enquiry" className="k-btn k-btn--solid">Enquire about training</TrackedLink>
              <TrackedLink href="/contact?interest=training" eventOffer="company capability programme" className="k-btn k-btn--ghost">Plan a company programme</TrackedLink>
            </Rise>
          </div>
          <Rise step={3} className="tr-hero-facts">
            <div><strong>12,000+</strong><span>professionals trained</span></div>
            <div><strong>18+ years</strong><span>training experience</span></div>
            <div><strong>CSSC USA</strong><span>international accreditation</span></div>
            <div><strong>5 cities</strong><span>plus on-site delivery</span></div>
          </Rise>
        </div>
      </section>

      <ClientStrip />

      <section className="k-band tr-learning-system overflow-hidden">
        <div className="k-shell">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,.85fr)_minmax(340px,.55fr)] lg:items-end">
            <div><Rise><p className="k-mono k-mono--ember">The supported learning journey</p></Rise><Rise step={1}><h2 className="k-title mt-8 max-w-[19ch]">The room creates understanding. The learning system keeps it moving.</h2></Rise></div>
            <Rise step={2}><p className="k-lead">Coursework, trainer feedback, applied projects and certification remain visible between sessions—supporting the facilitator without pretending the platform is the training.</p></Rise>
          </div>
          <Rise step={3} className="mt-14"><TrainingCommandCentre /></Rise>
        </div>
      </section>

      <section className="k-band k-band--2 overflow-hidden">
        <div className="k-shell grid gap-16 lg:grid-cols-[minmax(280px,.62fr)_minmax(0,1.38fr)]">
          <div className="lg:sticky lg:top-28 lg:self-start"><Rise><p className="k-mono k-mono--ember">01 — Beyond attendance</p></Rise><Rise step={1}><h2 className="k-title mt-8 max-w-[16ch]">The certificate is a milestone. Capability is the operating result.</h2></Rise><Rise step={2}><p className="k-lead mt-7">A course can transfer knowledge. A capability programme must also create confidence, application, sponsorship and evidence.</p></Rise></div>
          <div className="border-b border-[var(--hair)]">{programme.map(([verb, title, body], index) => <Rise key={verb}><article className="grid gap-5 border-t border-[var(--hair)] py-9 sm:grid-cols-[90px_minmax(0,.7fr)_minmax(0,1fr)] sm:items-baseline"><span className="text-[clamp(42px,6vw,76px)] font-semibold leading-none tracking-[-.07em] text-white/[.07]">{String(index + 1).padStart(2, "0")}</span><div><p className="k-mono k-mono--ember">{verb}</p><h3 className="k-sub mt-3">{title}</h3></div><p className="k-sm">{body}</p></article></Rise>)}</div>
        </div>
      </section>

      <section className="tr-workshop">
        <div className="k-shell">
          <div className="tr-workshop-head">
            <div><Rise><p className="k-mono k-mono--ember">LEARNING IN PRACTICE</p></Rise><Rise step={1}><h2 className="k-title mt-7 max-w-[17ch]">The method becomes real around the work.</h2></Rise></div>
            <Rise step={2}><p className="k-lead">Facilitated discussion, process mapping and live application turn course material into a shared way of seeing and solving operational problems.</p></Rise>
          </div>
          <Rise step={2} className="tr-workshop-frame">
            <div className="tr-workshop-main"><Photo src="/imagery/training/workshop-v1.webp" sizes="(min-width: 1024px) 72vw, 100vw" position="center" /></div>
            <div className="tr-workshop-caption"><span>01</span><p>Map the work together. Challenge the cause. Leave with a decision the learner can apply.</p></div>
            <div className="tr-workshop-detail"><Photo src="/imagery/training/hero-v2.webp" sizes="(min-width: 1024px) 24vw, 48vw" position="72% center" /></div>
          </Rise>
        </div>
      </section>

      <section className="k-band overflow-hidden">
        <div className="k-shell"><div className="grid gap-10 lg:grid-cols-[minmax(0,.8fr)_minmax(340px,.55fr)] lg:items-end"><div><Rise><p className="k-mono k-mono--ember">02 — Find your programme</p></Rise><Rise step={1}><h2 className="k-title mt-8 max-w-[19ch]">Choose the belt, format and date that fit the learner.</h2></Rise></div><Rise step={2}><p className="k-lead">Classroom, live virtual and self-paced routes lead into the same accredited learning journey. Current availability lives on Sigmafy.</p></Rise></div><Rise step={3} className="mt-14"><CourseFinder /></Rise></div>
      </section>

      <section className="k-band k-band--2 overflow-hidden">
        <div className="k-shell"><div className="grid gap-10 lg:grid-cols-[minmax(0,.8fr)_minmax(340px,.55fr)] lg:items-end"><div><Rise><p className="k-mono k-mono--ember">03 — Feedback that teaches</p></Rise><Rise step={1}><h2 className="k-title mt-8 max-w-[19ch]">The learner submits. A practitioner responds.</h2></Rise></div><Rise step={2}><p className="k-lead">Structured evaluation makes feedback faster; trainer judgement preserves rigour. Every revision and sign-off remains connected to the learner’s work.</p></Rise></div><Rise step={3} className="mt-14"><TrainerReview /></Rise></div>
      </section>

      <section className="k-band">
        <div className="k-shell"><Rise><p className="k-mono k-mono--ember">04 — Certification pathways</p></Rise><Rise step={1}><h2 className="k-title mt-8 max-w-[20ch]">From a shared language to improvement leadership.</h2></Rise><Rise step={2}><p className="k-lead mt-7 max-w-[55ch]">Choose the depth that matches the role. Six Sigma South Africa provides the course detail, schedules and enrolment.</p></Rise>
          <div className="mt-14 border-b border-[var(--hair)]">{pathways.map(([number, name, role, body, href]) => <Rise key={number}><Link href={href} className="group grid gap-4 border-t border-[var(--hair)] py-8 md:grid-cols-[70px_minmax(0,.55fr)_minmax(0,.65fr)_minmax(0,1fr)_auto] md:items-baseline"><span className="k-mono k-mono--ember">{number}</span><h3 className="k-title transition-colors group-hover:text-[var(--ember)]">{name}</h3><p className="k-mono">{role}</p><p className="k-sm">{body}</p><span className="k-link">Course ↗</span></Link></Rise>)}</div>
          <Rise className="mt-10"><Link href={`${TRAINING_SITE}courses`} className="k-link">Browse every course on Six Sigma South Africa ↗</Link></Rise>
        </div>
      </section>

      <section className="k-band k-band--2 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(90px,18vw,260px)] font-semibold leading-none tracking-[-.08em] text-white/[.018]" aria-hidden="true">CAPABILITY</div>
        <div className="k-shell relative grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.68fr)] lg:items-center"><div><Rise><p className="k-mono k-mono--ember">05 — Enterprise capability</p></Rise><Rise step={1}><h2 className="k-state mt-8 max-w-[16ch]">A training calendar is not yet an improvement system.</h2></Rise><Rise step={2}><p className="k-lead mt-8 max-w-[52ch]">For larger organisations, 2KO can connect role-based learning, project selection, sponsor governance, coaching, automation and Sigmafy measurement around a single capability roadmap.</p></Rise></div><Rise step={2}><div className="rounded-2xl border border-[var(--hair-2)] bg-[var(--panel)] p-8"><p className="k-mono k-mono--ember">Integrated partnership layer</p><ul className="mt-7 flex flex-col">{["Annual cohort and certification plan", "Live project pipeline and sponsor gates", "Practitioner coaching and operating reviews", "Workflow automation where the method should become control", "Sigmafy access and a governed benefits register"].map((item, index) => <li key={item} className="grid grid-cols-[32px_1fr] gap-3 border-t border-[var(--hair)] py-4 text-[13px] text-[var(--warm-70)]"><span className="k-mono">0{index + 1}</span>{item}</li>)}</ul><TrackedLink href="/contact?interest=training" eventOffer="enterprise capability programme" className="k-btn k-btn--solid mt-7 w-full">Design the programme</TrackedLink></div></Rise></div>
      </section>

      <section className="k-band"><div className="k-shell text-center"><Rise><p className="k-mono k-mono--ember">Choose the right route</p></Rise><Rise step={1}><h2 className="k-state mx-auto mt-8 max-w-[17ch]">Train an individual. Equip a team. Build an improvement system.</h2></Rise><Rise step={2}><p className="k-lead mx-auto mt-8 max-w-[54ch]">For a course or certification, go straight to Six Sigma South Africa. For a company-wide capability programme connected to operating results, bring the objective to 2KO.</p></Rise><Rise step={3} className="mt-10 flex flex-wrap justify-center gap-3"><Link href={TRAINING_SITE} className="k-btn k-btn--solid">Visit Six Sigma South Africa ↗</Link><TrackedLink href="/contact?interest=training" eventOffer="training programme" className="k-btn k-btn--ghost">Plan a company programme</TrackedLink></Rise></div></section>
    </>
  );
}
