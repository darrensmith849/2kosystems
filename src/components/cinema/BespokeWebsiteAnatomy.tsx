import Link from "next/link";
import type { Example } from "@/lib/websites";
import WebsiteWorkLinks from "./WebsiteWorkLinks";

export default function BespokeWebsiteAnatomy({ examples }: { examples: Example[] }) {
  return (
    <div className="xwa-wrap">
      <figure className="xwa-canvas" aria-label="A shadow-state representation of a bespoke web application architecture">
        <header className="xwa-head">
          <span>SYSTEM MAP · LIVE ARCHITECTURE</span>
          <strong>Public experience → working software</strong>
          <span>SECURE · MEASURABLE · OWNED</span>
        </header>

        <section className="xwa-entry">
          <span className="xwa-marker">01 · THE PUBLIC FRONT DOOR</span>
          <div className="xwa-entry-screen">
            <nav><b>YOUR PLATFORM</b><i /><i /><span>Sign in</span></nav>
            <div><small>THE PROMISE</small><h3>Useful before<br />the login.</h3><p><i /><i /></p><b>Get started →</b></div>
            <aside aria-hidden><i /><i /><i /></aside>
          </div>
        </section>

        <section className="xwa-identity">
          <span className="xwa-marker">02 · IDENTITY AND PERMISSION</span>
          <div className="xwa-gate"><i>01</i><span><small>PERSON</small><strong>Secure sign in</strong></span></div>
          <b className="xwa-arrow">↓</b>
          <div className="xwa-role-row">
            <article><small>ROLE A</small><strong>Customer</strong><span>Own records only</span></article>
            <article><small>ROLE B</small><strong>Operator</strong><span>Assigned work</span></article>
            <article><small>ROLE C</small><strong>Administrator</strong><span>System control</span></article>
          </div>
        </section>

        <section className="xwa-workspace">
          <span className="xwa-marker">03 · THE WORKSPACE</span>
          <div className="xwa-app">
            <aside><b>2K</b><i /><i /><i /><i /><span /></aside>
            <main>
              <header><span>OPERATIONS</span><small>MONDAY · LIVE</small></header>
              <div className="xwa-metrics"><article><small>OPEN</small><strong>24</strong></article><article><small>IN PROGRESS</small><strong>07</strong></article><article><small>COMPLETE</small><strong>148</strong></article></div>
              <div className="xwa-work-grid"><section><span>MY WORK</span>{[1,2,3,4].map(row => <p key={row}><i /><b /><small /></p>)}</section><aside><span>DETAIL</span><i /><b /><p /><p /><button type="button" tabIndex={-1}>Complete action</button></aside></div>
            </main>
          </div>
        </section>

        <section className="xwa-integrations">
          <span className="xwa-marker">04 · CONNECTED TO THE BUSINESS</span>
          <h3>The platform does not live alone.</h3>
          <div className="xwa-system-map">
            <article><small>INPUT</small><strong>Website</strong></article><b>→</b>
            <article><small>WORK</small><strong>Application</strong></article><b>→</b>
            <article><small>RECORD</small><strong>Database</strong></article>
            <div className="xwa-branches"><span>↘ Email</span><span>↓ Payments</span><span>↙ Existing systems</span></div>
          </div>
        </section>

        <section className="xwa-control">
          <span className="xwa-marker">05 · CONTROL AFTER LAUNCH</span>
          <div><small>THE SYSTEM LEAVES EVIDENCE</small><h3>Every important action can be seen.</h3></div>
          <ul><li><span>01</span><strong>Who did it</strong></li><li><span>02</span><strong>What changed</strong></li><li><span>03</span><strong>When it happened</strong></li><li><span>04</span><strong>Whether it worked</strong></li></ul>
        </section>

        <figcaption><span>Illustrative architecture—not an off-the-shelf portal.</span><span>The scope is written around the work the software must perform.</span></figcaption>
      </figure>
      <WebsiteWorkLinks examples={examples} />
      <Link href="#included" className="lwa-continue">Continue to the written scope <span>↓</span></Link>
    </div>
  );
}
