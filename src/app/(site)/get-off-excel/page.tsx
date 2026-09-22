import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import Photo from "@/components/cinema/Photo";
import ExcelReel, { ExcelAuditScene, ExcelWorkflowScenes } from "@/components/cinema/ExcelReel";
import { RATES, TERMS, TIMEBOX } from "@/lib/pricing";
import { SITE_URL } from "@/lib/site";

const PRICE = RATES.getOffExcel;
const TIMEBOXED = TIMEBOX.getOffExcel;

export const metadata: Metadata = completePageMetadata({
  title: "Get Off Excel — Replace a Spreadsheet With a System",
  description: `Replace the spreadsheet your operation runs on with a real multi-user system in ${TIMEBOXED}. Fixed price ${PRICE} ex VAT, fixed scope.`,
  alternates: { canonical: "/get-off-excel" },
});

const symptoms = [
  { code: "FILE LOCK", title: "Locked for editing", detail: "Two people need the file. One waits or starts another copy." },
  { code: "VERSION", title: "Final_v3_USE_THIS_ONE", detail: "The latest attachment becomes the master until the next email." },
  { code: "FORMULA", title: "#REF! in the monthly report", detail: "The logic lives in hidden tabs only one person understands." },
  { code: "RE-ENTRY", title: "Three days of copy-paste", detail: "The same figures are retyped into the same report every month." },
];

const included = [
  "One spreadsheet rebuilt as a web-based system",
  "Secure login with up to three roles",
  "True multi-user access — one live set of records",
  "Your existing data migrated and reconciled",
  "Validation so bad data cannot be captured",
  "Full audit trail — who, what, when, previous value",
  "One standard report set, plus CSV and Excel export",
  "Automated daily backups",
  "Hosted and live on your own domain",
  "Training and a written handover document",
  "Source code and documentation — you own it",
  `${TERMS.postLaunchSupportDays} days of post-launch support`,
];

const excluded = [
  "Integrations with Sage, Pastel, Syspro or Xero",
  "More than three roles, or per-person permissions",
  "App-store mobile apps (it works in a phone browser)",
  "More than one spreadsheet or workflow",
  "AI features — drafting, classification, document Q&A",
  "Custom dashboards beyond the standard report set",
  "Rebuilding source data that is too broken to migrate",
  "Third-party licences and hosting after the first month",
];

const faqs = [
  { q: `What if it takes longer than ${TIMEBOXED}?`, a: `That is our risk. The price is fixed against the scope agreed in week one. If we estimated badly we absorb it. The only thing that moves the price is you adding scope — quoted at ${RATES.dayRate} per day and approved in writing before any work starts.` },
  { q: "Who owns the system and the code?", a: "You do, from day one. Source, documentation and data are yours, built on mainstream technology any competent developer can pick up. No proprietary platform holding your operation hostage." },
  { q: "Where does our data live?", a: "In a region you choose, and we tell you exactly where before you sign. Access is role-based, changes are logged, and if your policy requires the data to stay in South Africa we host it accordingly." },
  { q: "Can it talk to Sage or Pastel later?", a: `Yes, and it is built so that it can — but not inside this product. An integration changes the shape and the risk of the work, so it belongs in a Proof-of-Value Pilot (from ${RATES.pilotFrom}). Getting off the spreadsheet first gives the integration something clean to connect to.` },
  { q: `What happens after the ${TERMS.postLaunchSupportDays} days?`, a: "Nothing you have to buy. The system is built to run independently and you own everything needed to operate it. Most clients move onto a retainer; it is a choice, not a condition." },
  { q: "How do we know it fits the fixed price?", a: `We tell you before you pay anything. The scoping call is free, and if your process is bigger than this product we say so rather than sell it to you. Where it is genuinely unclear, a ${RATES.review} Half-Day Process Review settles it — and that fee comes off whatever you commission next.` },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Get Off Excel — spreadsheet replacement system",
  description: `A fixed-price, fixed-scope engagement that replaces one business-critical spreadsheet with a secure multi-user web system in ${TIMEBOXED}.`,
  brand: { "@type": "Brand", name: "2KO" },
  offers: { "@type": "Offer", price: "79500", priceCurrency: "ZAR", availability: "https://schema.org/InStock", priceValidUntil: "2027-12-31", url: `${SITE_URL}/get-off-excel` },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function GetOffExcelPage() {
  return (
    <div className="gx-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="gx-hero">
        <div className="gx-hero-grid" aria-hidden />
        <div className="k-shell gx-hero-inner">
          <div className="gx-visual-hero-head">
            <div>
              <Rise><p className="k-mono k-mono--ember">GET OFF EXCEL · FIXED PRICE · {TIMEBOXED}</p></Rise>
              <Rise step={1}><h1>Get off Excel.</h1></Rise>
            </div>
            <Rise step={2}><p>One critical spreadsheet<br />becomes one live operational system.</p></Rise>
          </div>
          <Rise step={3} className="gx-hero-visual"><ExcelReel /></Rise>
        </div>
      </section>

      <section className="gx-hero-story">
        <div className="k-shell">
          <div className="gx-story-layout">
            <div className="gx-story-main">
              <Rise><p className="k-mono">THE PROPOSITION</p></Rise>
              <Rise step={1}><h2>The spreadsheet did its job. Now build the system around it.</h2></Rise>
            </div>
            <div className="gx-story-side">
              <Rise step={1}><p>We turn the file your operation depends on into one clean, secure workspace—where people capture, approve, resolve and report without version hunting.</p></Rise>
              <Rise step={2} className="gx-hero-actions">
                <Link href="/contact?interest=get-off-excel" className="k-btn k-btn--solid">Book a free scoping call</Link>
                <Link href="#scope" className="k-btn k-btn--ghost">See the fixed scope</Link>
              </Rise>
            </div>
          </div>
          <Rise step={2} className="gx-hero-facts">
            <span><b>{PRICE}</b><small>ex VAT · fixed</small></span>
            <span><b>{TIMEBOXED}</b><small>to go-live</small></span>
            <span><b>One</b><small>live source of truth</small></span>
            <span><b>Yours</b><small>code and data</small></span>
          </Rise>
        </div>
      </section>

      <section id="spreadsheet-problems" className="gx-friction">
        <div className="k-shell gx-friction-layout">
          <div className="gx-friction-copy">
            <Rise><p className="k-mono">01 · THE BREAKING POINT</p></Rise>
            <Rise step={1}><h2>You do not need another spreadsheet. You need the process it was trying to become.</h2></Rise>
            <Rise step={2}><p>The clues are already in the file: the dropdowns are rules, the colour coding is status, the email chain is approval and the hidden formula is business logic. We make those things explicit, reliable and usable by everyone.</p></Rise>
          </div>
          <div className="gx-friction-stack">
            <Rise className="gx-friction-photo">
              <Photo src="/imagery/get-off-excel/process-detail-v1.webp" sizes="(min-width: 1024px) 48vw, 100vw" position="center" />
              <div><span>THE HIDDEN SYSTEM</span><p>The file already contains the first draft of the workflow. We make its rules, routes and ownership explicit.</p></div>
            </Rise>
            {symptoms.map((symptom, index) => (
              <Rise key={symptom.code} step={(index % 3) as 0 | 1 | 2}>
                <article><span>{symptom.code}</span><div><h3>{symptom.title}</h3><p>{symptom.detail}</p></div><i>{String(index + 1).padStart(2, "0")}</i></article>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section id="system" className="gx-workspace-band">
        <div className="k-shell">
          <div className="gx-section-head">
            <Rise><p className="k-mono k-mono--ember">02 · THE WORKING SYSTEM</p></Rise>
            <Rise step={1}><h2>Not a prettier table. A place where the work can move.</h2></Rise>
            <Rise step={2}><p>Every screen exists because somebody has a job to do: capture a clean record, route an exception, make a decision or prove what happened.</p></Rise>
          </div>
          <Rise step={2}><ExcelWorkflowScenes /></Rise>
        </div>
      </section>

      <section id="audit-trail" className="gx-history-band">
        <div className="k-shell">
          <div className="gx-history-head">
            <div><Rise><p className="k-mono">03 · THE RECORD REMEMBERS</p></Rise><Rise step={1}><h2>Every edit becomes evidence.</h2></Rise></div>
            <Rise step={2}><p>Instead of reconstructing the story from filenames and messages, the system keeps the decision, owner, previous value and time together.</p></Rise>
          </div>
          <Rise step={2}><ExcelAuditScene /></Rise>
        </div>
      </section>

      <section id="pricing" className="gx-commercial">
        <div className="k-shell gx-commercial-layout">
          <div className="gx-price-lockup">
            <Rise><p className="k-mono k-mono--ember">04 · ONE DEFINED BUILD</p></Rise>
            <Rise step={1}><strong>{PRICE}</strong></Rise>
            <Rise step={2}><span>ex VAT · {TIMEBOXED} · one spreadsheet</span></Rise>
            <Rise step={3}><p>Not an estimate and not billed by the hour. We agree the scope in week one. If we under-estimate the build, that is ours to carry.</p></Rise>
          </div>
          <Rise step={2} className="gx-terms-card">
            <header><span>Commercial terms</span><small>FIXED</small></header>
            <dl><div><dt>On signature</dt><dd>50%</dd></div><div><dt>On go-live</dt><dd>50%</dd></div><div><dt>Scope additions</dt><dd>{RATES.dayRate}/day</dd></div><div><dt>Surprise invoices</dt><dd>Never</dd></div></dl>
            <p>Send the spreadsheet and a call is enough to scope it. If the workflow is bigger than this product, we say so before you pay anything.</p>
          </Rise>
        </div>
      </section>

      <section id="scope" className="gx-scope">
        <div className="k-shell">
          <div className="gx-section-head gx-section-head--scope">
            <Rise><p className="k-mono">05 · THE SCOPE BOX</p></Rise>
            <Rise step={1}><h2>Exactly what the price buys. Exactly where the box ends.</h2></Rise>
          </div>
          <div className="gx-scope-grid">
            <Rise className="gx-scope-list" step={1}>
              <header><span>Included in {PRICE}</span><small>{included.length} DELIVERABLES</small></header>
              <ol>{included.map((item, index) => <li key={item}><i>✓</i><span>{item}</span><b>{String(index + 1).padStart(2, "0")}</b></li>)}</ol>
            </Rise>
            <Rise className="gx-scope-list gx-scope-list--muted" step={2}>
              <header><span>Quoted separately</span><small>CHANGES THE SHAPE</small></header>
              <ol>{excluded.map((item, index) => <li key={item}><i>—</i><span>{item}</span><b>{String(index + 1).padStart(2, "0")}</b></li>)}</ol>
              <p>Real work we do—it simply gets its own scope and price because it changes the delivery risk.</p>
            </Rise>
          </div>
        </div>
      </section>

      <section className="gx-faq">
        <div className="k-shell gx-faq-layout">
          <div><Rise><p className="k-mono k-mono--ember">06 · BEFORE YOU SIGN</p></Rise><Rise step={1}><h2>The questions that should be answered before a build begins.</h2></Rise></div>
          <div className="gx-faq-list">
            {faqs.map((faq, index) => <Rise key={faq.q} step={(index % 3) as 0 | 1 | 2}><details open={index === 0}><summary><span>{faq.q}</span><i>＋</i></summary><p>{faq.a}</p></details></Rise>)}
          </div>
        </div>
      </section>

      <section className="gx-close">
        <div className="gx-close-grid" aria-hidden />
        <div className="k-shell gx-close-inner">
          <Rise><p className="k-mono">START WITH THE FILE</p></Rise>
          <Rise step={1}><h2>Send us the spreadsheet. We will show you the system hiding inside it.</h2></Rise>
          <Rise step={2}><p>A scoping call costs nothing and takes about thirty minutes. You will leave knowing whether {PRICE} covers the process—or what would.</p></Rise>
          <Rise step={3} className="gx-close-actions"><Link href="/contact?interest=get-off-excel" className="k-btn k-btn--solid">Book a free scoping call</Link><Link href="/pricing" className="k-btn k-btn--ghost">See all pricing</Link></Rise>
        </div>
      </section>
    </div>
  );
}
