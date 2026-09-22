import Link from "next/link";
import type { Product } from "@/lib/products";
import { RATES, TERMS } from "@/lib/pricing";
import JobCardReel from "@/components/cinema/JobCardReel";
import Rise from "@/components/cinema/Rise";
import Photo from "@/components/cinema/Photo";

const day = [
  ["06:45", "Plan", "The office sees every open job, available crew and site commitment before the first vehicle leaves."],
  ["07:30", "Dispatch", "One work order carries the asset, site, task, priority and required evidence to the right crew."],
  ["09:42", "Execute", "The technician records readings, parts, time and photos at the point of work—even without signal."],
  ["10:08", "Control", "An out-of-range reading leaves the normal path and reaches a named supervisor with its context attached."],
  ["14:42", "Close", "The job cannot close until the required checks, proof and sign-off are complete."],
];

export default function JobCardProductPage({ product, others }: { product: Product; others: Product[] }) {
  return (
    <div className="jc-page">
      <nav aria-label="Breadcrumb" className="k-shell jc-breadcrumb">
        <ol><li><Link href="/systems">Systems</Link></li><li aria-hidden>／</li><li>{product.name}</li></ol>
      </nav>

      <section className="jc-hero">
        <div className="jc-hero-grid" aria-hidden />
        <div className="k-shell jc-hero-inner">
          <div className="jc-visual-head">
            <div>
              <Rise><p className="k-mono k-mono--ember">JOB CARD SYSTEM · FIXED PRICE · {product.timebox}</p></Rise>
              <Rise step={1}><h1>Run the job.<br /><span>Prove the close-out.</span></h1></Rise>
            </div>
            <Rise step={2}><p>From dispatch to field evidence,<br />the work and its record move together.</p></Rise>
          </div>
          <Rise step={3} className="jc-hero-product"><JobCardReel /></Rise>
        </div>
      </section>

      <section className="jc-story">
        <div className="k-shell">
          <div className="jc-story-layout">
            <div><Rise><p className="k-mono">THE PROPOSITION</p></Rise><Rise step={1}><h2>The card closes before the crew leaves site.</h2></Rise></div>
            <div><Rise step={1}><p>{product.summary} The office sees the same live record, so nobody waits for paper to return or retypes what already happened.</p></Rise><Rise step={2} className="jc-actions"><Link href="/contact?interest=job-card-system" className="k-btn k-btn--solid">Book a free scoping call</Link><Link href="#scope" className="k-btn k-btn--ghost">See the fixed scope</Link></Rise></div>
          </div>
          <Rise step={2} className="jc-facts"><span><b>{product.price}</b><small>ex VAT · fixed</small></span><span><b>{product.timebox}</b><small>to go-live</small></span><span><b>Offline</b><small>field capture</small></span><span><b>Yours</b><small>code and data</small></span></Rise>
        </div>
      </section>

      <section className="jc-day">
        <div className="k-shell jc-day-layout">
          <div className="jc-day-copy"><Rise><p className="k-mono k-mono--ember">01 · ONE OPERATING DAY</p></Rise><Rise step={1}><h2>The system follows the work—not the paperwork.</h2></Rise><Rise step={2}><p>Every handoff becomes a visible state. Every exception gets an owner. Every close-out leaves a record somebody can actually retrieve.</p></Rise></div>
          <ol className="jc-timeline">
            {day.map(([time, title, body], index) => <Rise key={title} step={(index % 3) as 0 | 1 | 2}><li data-active={index === 2}><time>{time}</time><i>{String(index + 1).padStart(2, "0")}</i><div><h3>{title}</h3><p>{body}</p></div></li></Rise>)}
          </ol>
        </div>
      </section>

      <section className="jc-field-photo">
        <Rise variant="settle" className="jc-field-photo__media"><Photo src="/imagery/systems/products/job-card-v1.webp" sizes="100vw" position="center" /></Rise>
        <div className="jc-field-photo__shade" aria-hidden />
        <div className="k-shell jc-field-photo__copy"><Rise><p className="k-mono k-mono--ember">AT THE POINT OF WORK</p></Rise><Rise step={1}><h2>Complete the repair. Capture the proof. Leave no paperwork behind.</h2></Rise><Rise step={2}><p className="image-chapter-lead">The same record follows the technician, supervisor and office—from dispatch through evidence and sign-off.</p></Rise></div>
      </section>

      <section className="jc-proof">
        <div className="k-shell">
          <div className="jc-proof-head"><div><Rise><p className="k-mono">02 · THE COMPLETE RECORD</p></Rise><Rise step={1}><h2>Proof is captured while it is still easy to capture.</h2></Rise></div><Rise step={2}><p>A timestamped photo, a serial number and a signature are useful at the site. Three days later they become an argument, a rejected claim or somebody’s best guess.</p></Rise></div>
          <Rise step={2} className="jc-evidence-board">
            <article className="jc-evidence-job"><header><span>JC-2041</span><b>CLOSED</b></header><p>Hydraulic hose replacement</p><dl><div><dt>Site</dt><dd>North shaft</dd></div><div><dt>Completed</dt><dd>14:42</dd></div><div><dt>Technician</dt><dd>T. Molefe</dd></div><div><dt>Total cost</dt><dd>R4,960</dd></div></dl></article>
            <div className="jc-evidence-links"><span>WORK DONE</span><i /><span>PROOF ATTACHED</span></div>
            <div className="jc-evidence-stack"><article data-kind="photo"><span>PHOTO 04</span><div>04</div><p>New hose installed<br /><small>14:31 · on site</small></p></article><article data-kind="serial"><span>ASSET RECORD</span><strong>P-17</strong><p>Serial verified<br /><small>Previous value retained</small></p></article><article data-kind="sign"><span>SIGN-OFF</span><div className="jc-evidence-sign">L. Mokoena</div><p>Client accepted<br /><small>14:42 · location recorded</small></p></article></div>
            <figcaption>Illustrative record and values · designed to show the mechanism, not claim a client result</figcaption>
          </Rise>
        </div>
      </section>

      <section className="jc-friction">
        <div className="k-shell jc-friction-layout">
          <div className="jc-friction-copy"><Rise><p className="k-mono k-mono--ember">03 · WHERE CONTROL BREAKS</p></Rise><Rise step={1}><h2>You usually feel the failure after the work is finished.</h2></Rise><Rise step={2}><p>The system moves the control to the moment the information exists, instead of asking the office to reconstruct it later.</p></Rise></div>
          <div className="jc-friction-list">{product.symptoms.map((symptom, index) => <Rise key={symptom.t} step={(index % 3) as 0 | 1 | 2}><article><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{symptom.t}</h3><p>{symptom.d}</p></div></article></Rise>)}</div>
        </div>
      </section>

      <section className="jc-commercial">
        <div className="k-shell jc-commercial-layout">
          <div className="jc-price"><Rise><p className="k-mono k-mono--ember">04 · ONE DEFINED BUILD</p></Rise><Rise step={1}><strong>{product.price}</strong></Rise><Rise step={2}><span>ex VAT · {product.timebox} · fixed scope</span></Rise><Rise step={3}><p>Not an estimate and not billed by the hour. We agree the operating boundary before we begin. If we under-estimate the build inside that boundary, the risk is ours.</p></Rise></div>
          <Rise step={2} className="jc-terms"><header><span>Commercial terms</span><small>FIXED</small></header><dl><div><dt>On signature</dt><dd>50%</dd></div><div><dt>On go-live</dt><dd>50%</dd></div><div><dt>Scope additions</dt><dd>{RATES.dayRate}/day</dd></div><div><dt>Post-launch support</dt><dd>{TERMS.postLaunchSupportDays} days</dd></div></dl><p>A scoping call and a look at the current job card are enough to confirm whether the fixed box fits.</p></Rise>
        </div>
      </section>

      <section id="scope" className="jc-scope">
        <div className="k-shell">
          <div className="jc-section-head"><Rise><p className="k-mono">05 · THE SCOPE BOX</p></Rise><Rise step={1}><h2>Exactly what the price buys. Exactly where the box ends.</h2></Rise></div>
          <div className="jc-scope-grid">
            <Rise className="jc-scope-list" step={1}><header><span>Included in {product.price}</span><small>{product.included.length} DELIVERABLES</small></header><ol>{product.included.map((item, index) => <li key={item}><i>✓</i><span>{item}</span><b>{String(index + 1).padStart(2, "0")}</b></li>)}</ol></Rise>
            <Rise className="jc-scope-list jc-scope-list--muted" step={2}><header><span>Quoted separately</span><small>CHANGES THE SHAPE</small></header><ol>{product.excluded.map((item, index) => <li key={item}><i>—</i><span>{item}</span><b>{String(index + 1).padStart(2, "0")}</b></li>)}</ol><p>Real work we do—it simply gets its own scope because it changes the delivery risk.</p></Rise>
          </div>
        </div>
      </section>

      <section className="jc-faq"><div className="k-shell jc-faq-layout"><div><Rise><p className="k-mono k-mono--ember">06 · BEFORE YOU SIGN</p></Rise><Rise step={1}><h2>Questions the system should answer before the first job is raised.</h2></Rise></div><div className="jc-faq-list">{product.faqs.map((faq, index) => <Rise key={faq.q} step={(index % 3) as 0 | 1 | 2}><details open={index === 0}><summary><span>{faq.q}</span><i>＋</i></summary><p>{faq.a}</p></details></Rise>)}</div></div></section>

      <section className="jc-more"><div className="k-shell"><Rise><p className="k-mono">OTHER BOUNDED SYSTEMS</p></Rise><div>{others.map((other, index) => <Rise key={other.slug} step={(index % 3) as 0 | 1 | 2}><Link href={`/systems/${other.slug}`}><span>0{index + 1}</span><div><h3>{other.name}</h3><p>{other.summary}</p></div><b>{other.price}<small>{other.timebox}</small></b></Link></Rise>)}</div></div></section>

      <section className="jc-close"><div className="jc-close-grid" aria-hidden /><div className="k-shell jc-close-inner"><Rise><p className="k-mono">START WITH THE CURRENT CARD</p></Rise><Rise step={1}><h2>Show us how the work moves today.</h2></Rise><Rise step={2}><p>In thirty minutes, we can tell you whether {product.price} covers the process—and what has to be true for the new system to work in the field.</p></Rise><Rise step={3} className="jc-actions"><Link href="/contact?interest=job-card-system" className="k-btn k-btn--solid">Book a free scoping call</Link><Link href="/pricing" className="k-btn k-btn--ghost">See all pricing</Link></Rise></div></section>
    </div>
  );
}
