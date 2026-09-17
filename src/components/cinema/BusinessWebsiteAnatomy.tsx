import Link from "next/link";
import type { Example } from "@/lib/websites";
import WebsiteWorkLinks from "./WebsiteWorkLinks";

const pages = ["Home", "Services", "Work", "About", "Team", "Insights", "Contact", "Thank you"];

export default function BusinessWebsiteAnatomy({ examples }: { examples: Example[] }) {
  return (
    <div className="bwa-wrap">
      <figure className="bwa-canvas" aria-label="A shadow-state representation of a multi-page Business website">
        <header className="bwa-topbar">
          <span>MULTI-PAGE BUSINESS SITE</span>
          <strong>8 purposeful destinations</strong>
        </header>

        <section className="bwa-map">
          <p className="bwa-kicker">THE NAVIGATION HAS A JOB</p>
          <h3>Every question gets a clear destination.</h3>
          <div className="bwa-map-line" aria-hidden />
          <ol>
            {pages.map((page, index) => (
              <li key={page} className={index === 0 ? "is-home" : ""}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{page}</strong>
              </li>
            ))}
          </ol>
        </section>

        <section className="bwa-page-stack">
          <div className="bwa-page bwa-page--home">
            <span className="bwa-page-label">01 · HOME</span>
            <div className="bwa-mini-nav"><b>YOUR COMPANY</b><i /><i /><i /><i /></div>
            <div className="bwa-home-grid">
              <div>
                <small>ONE POSITION</small>
                <h3>The company<br />understood quickly.</h3>
                <p><i /><i /></p>
                <b className="bwa-cta">Start here →</b>
              </div>
              <div className="bwa-home-image" aria-hidden><i /><i /><i /></div>
            </div>
            <div className="bwa-home-proof" aria-hidden><i /><i /><i /><i /></div>
          </div>

          <div className="bwa-secondary-pages">
            <article className="bwa-page bwa-page--services">
              <span className="bwa-page-label">02 · SERVICES</span>
              <h4>Each service explained<br />on its own terms.</h4>
              <div className="bwa-service-list"><i /><i /><i /></div>
            </article>
            <article className="bwa-page bwa-page--proof">
              <span className="bwa-page-label">03 · WORK</span>
              <div className="bwa-proof-image" aria-hidden />
              <h4>Proof with context.</h4>
              <p><i /><i /></p>
            </article>
          </div>

          <div className="bwa-secondary-pages bwa-secondary-pages--reverse">
            <article className="bwa-page bwa-page--people">
              <span className="bwa-page-label">04 · PEOPLE</span>
              <div className="bwa-people" aria-hidden><i /><i /><i /></div>
              <h4>A real team, introduced properly.</h4>
            </article>
            <article className="bwa-page bwa-page--contact">
              <span className="bwa-page-label">05 · CONVERT</span>
              <small>ROUTED TO THE RIGHT PERSON</small>
              <h4>The enquiry arrives<br />with useful context.</h4>
              <div className="bwa-form" aria-hidden><i /><i /><i /><b>Send enquiry →</b></div>
            </article>
          </div>
        </section>

        <figcaption>
          <span>Not eight pages for the sake of page count.</span>
          <span>One connected site, built around how buyers investigate.</span>
        </figcaption>
      </figure>
      <WebsiteWorkLinks examples={examples} />
      <Link href="#included" className="lwa-continue">Continue to the written scope <span>↓</span></Link>
    </div>
  );
}
