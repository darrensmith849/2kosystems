import Link from "next/link";
import type { Example } from "@/lib/websites";
import WebsiteWorkLinks from "./WebsiteWorkLinks";

export default function LaunchWebsiteAnatomy({ examples }: { examples: Example[] }) {
  return (
    <div className="lwa-layout">
      <aside className="lwa-guide" aria-label="Launch website structure">
        <p className="k-mono k-mono--ember">THE COMPLETE PAGE</p>
        <ol>
          <li><span>01</span><div><strong>Position</strong><small>Say what you do</small></div></li>
          <li><span>02</span><div><strong>Prove</strong><small>Make belief easier</small></div></li>
          <li><span>03</span><div><strong>Explain</strong><small>Show the offer</small></div></li>
          <li><span>04</span><div><strong>Reassure</strong><small>Remove hesitation</small></div></li>
          <li><span>05</span><div><strong>Convert</strong><small>Make contact obvious</small></div></li>
          <li><span>06</span><div><strong>Handover</strong><small>Own what was built</small></div></li>
        </ol>
        <p className="lwa-guide-note">One continuous page. Nothing included merely to make it longer.</p>
      </aside>

      <figure className="lwa-canvas" aria-label="A shadow-state representation of the sections included in a 2KO Launch website">
        <div className="lwa-browser">
          <span className="lwa-dots"><i /><i /><i /></span>
          <span className="lwa-address">yourbusiness.co.za</span>
          <span className="lwa-live">LIVE</span>
        </div>

        <div className="lwa-page">
          <section className="lwa-block lwa-hero-block">
            <span className="lwa-marker">01 · POSITION</span>
            <nav aria-hidden="true"><b>YOUR BUSINESS</b><span>Service</span><span>Proof</span><span>Contact</span></nav>
            <div className="lwa-hero-copy">
              <p>ONE CLEAR PROMISE</p>
              <h3>What you do.<br /><span>Why it matters.</span></h3>
              <div className="lwa-lines"><i /><i /></div>
              <button type="button" tabIndex={-1}>Take the next step <span>→</span></button>
            </div>
            <div className="lwa-hero-shape" aria-hidden><i /><i /><i /></div>
            <footer><span>Fast on mobile</span><span>Written for you</span><span>One obvious action</span></footer>
          </section>

          <section className="lwa-block lwa-proof-strip">
            <span className="lwa-marker">02 · PROVE</span>
            <p>TRUST ARRIVES BEFORE THE SALES PITCH</p>
            <div className="lwa-logos" aria-hidden><i /><i /><i /><i /><i /></div>
            <div className="lwa-rating"><strong>4.9</strong><span>★★★★★</span><small>Verified customer reviews</small></div>
          </section>

          <section className="lwa-block lwa-offer-block">
            <span className="lwa-marker">03 · EXPLAIN</span>
            <header><p>THE OFFER</p><h3>Enough detail to decide.</h3><span>Three short service explanations—not an encyclopaedia.</span></header>
            <div className="lwa-offer-grid">
              {["Primary service", "Supporting service", "Useful extra"].map((label, index) => (
                <article key={label}><span>0{index + 1}</span><i aria-hidden /><h4>{label}</h4><p>What it solves and who it is for.</p><b>Learn enough →</b></article>
              ))}
            </div>
          </section>

          <section className="lwa-block lwa-reassure-block">
            <span className="lwa-marker">04 · REASSURE</span>
            <div className="lwa-reassure-copy"><p>WHY THIS BUSINESS</p><h3>Answer the doubt<br />before it is raised.</h3><div className="lwa-lines"><i /><i /><i /></div></div>
            <div className="lwa-reassure-stack">
              <article><span>01</span><div><strong>Established</strong><small>The experience is visible.</small></div></article>
              <article><span>02</span><div><strong>Local</strong><small>A real business in a real place.</small></div></article>
              <article><span>03</span><div><strong>Specific</strong><small>Proof matches the promise.</small></div></article>
            </div>
          </section>

          <section className="lwa-block lwa-convert-block">
            <span className="lwa-marker">05 · CONVERT</span>
            <header><p>MAKE THE NEXT STEP EASY</p><h3>Ready when they are.</h3><span>No hunting for a number. No form that feels like an application.</span></header>
            <div className="lwa-contact-card">
              <div><label>Name</label><i /></div>
              <div><label>Email or phone</label><i /></div>
              <div className="lwa-contact-wide"><label>What do you need?</label><i /></div>
              <button type="button" tabIndex={-1}>Send the enquiry <span>→</span></button>
              <small>Or call directly · 0XX XXX XXXX</small>
            </div>
          </section>

          <section className="lwa-block lwa-handover-block">
            <span className="lwa-marker">06 · HANDOVER</span>
            <div><p>THE FINISHED BUILD IS YOURS</p><h3>Live, measurable and handed over.</h3></div>
            <ul><li>Own domain</li><li>Analytics</li><li>Contact routing</li><li>Editable content</li><li>30-day support</li></ul>
          </section>
        </div>

        <figcaption>
          <span>Illustrative structure—not a template.</span>
          <span>Every Launch site is written and designed around the business it represents.</span>
        </figcaption>
      </figure>

      <WebsiteWorkLinks examples={examples} />
      <Link href="#included" className="lwa-continue">Continue to the written scope <span>↓</span></Link>
    </div>
  );
}
