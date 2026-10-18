import type { Metadata } from "next";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import PartnerConsole from "@/components/kos/PartnerConsole";
import { LANDING_PAGE, PRICE_NOTE, PRODUCTS, rand } from "@/lib/kos/catalogue";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const STEPS = [
  { h: "Pick what to sell", p: "Choose the tools that fit your clients, and set your own price for each." },
  { h: "Send the page", p: "Every tool has a page with your name on it. Send the link. Your client asks you about it." },
  { h: "Get paid, every month", p: "Your client pays by card. It splits on its own: our part to us, the rest to you." },
];

export default function KosHome() {
  return (
    <>
      <section className="k-shell ks-hero">
        <div>
          <Rise>
            <p className="k-mono k-mono--ember">For agencies, web designers and consultants</p>
            <h1 className="k-hero">Sell our tools under your own name.</h1>
            <p className="k-lead">
              Give the small businesses you look after a receptionist that answers WhatsApp, online bookings and a proper
              business email. Your brand, your price. We do the work in the background.
            </p>
          </Rise>
          <Rise step={1}>
            <div className="ks-actions">
              <Link href="/apply" className="k-btn k-btn--solid">
                Become a partner
              </Link>
              <Link href="/earn" className="k-btn k-btn--ghost">
                See what you&apos;d earn
              </Link>
            </div>
          </Rise>
        </div>
        <div className="ks-visual">
          <PartnerConsole />
        </div>
      </section>

      <section className="k-band k-hairline">
        <div className="k-shell">
          <div className="ks-head">
            <p className="k-mono k-mono--ember">What you can sell</p>
            <h2 className="k-title">Three tools every small business needs.</h2>
            <p className="k-lead">None of them need a website. If your client has no website, they get a simple page free.</p>
          </div>
          <div className="ks-grid3">
            {PRODUCTS.map((p) => (
              <Link key={p.key} href={`/${p.key}`} className="ks-card">
                <span className="ks-tag">{p.status}</span>
                <h3>{p.name}</h3>
                <p>{p.line}</p>
                <span className="ks-card-foot">
                  <span>
                    Our price <b>{rand(p.wholesale)}</b>
                  </span>
                  <span>
                    You charge <b>~{rand(p.suggested)}</b>
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <div className="ks-free">
            <span className="ks-tag">Free</span>
            <span>
              <b>{LANDING_PAGE.name}.</b> {LANDING_PAGE.line}
            </span>
          </div>
          <p className="ks-note">Prices are per client, per month. {PRICE_NOTE}</p>
        </div>
      </section>

      <section className="k-band k-hairline">
        <div className="k-shell">
          <div className="ks-head">
            <p className="k-mono k-mono--ember">How it works</p>
            <h2 className="k-title">Three steps. No tech work for you.</h2>
          </div>
          <ol className="ks-steps">
            {STEPS.map((s) => (
              <li key={s.h}>
                <b>{s.h}</b>
                <span>{s.p}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="k-band k-hairline">
        <div className="k-shell">
          <div className="ks-split" style={{ marginTop: 0 }}>
            <div>
              <p className="k-mono">What your clients see</p>
              <h2 className="k-sub" style={{ marginTop: 12 }}>
                Your name. Never ours.
              </h2>
              <p className="k-sm" style={{ marginTop: 10 }}>
                Every page, message and receipt your client gets carries your brand. They know you, not us.
              </p>
              <div className="ks-actions" style={{ marginTop: 20 }}>
                <Link href="/kit/demo" className="k-link">
                  See a client page →
                </Link>
              </div>
            </div>
            <div className="ks-us">
              <p className="k-mono k-mono--ember">What you do</p>
              <h2 className="k-sub" style={{ marginTop: 12 }}>
                Sell it, and be their first call.
              </h2>
              <p className="k-sm" style={{ marginTop: 10 }}>
                We set it up, keep it running and fix it when it breaks. You keep the relationship and the margin.
              </p>
              <div className="ks-actions" style={{ marginTop: 20 }}>
                <Link href="/earn" className="k-link">
                  Work out your margin →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="k-band">
        <div className="k-shell">
          <div className="ks-cta-band">
            <p className="k-mono k-mono--ember">Signing our first partners now</p>
            <h2 className="k-title" style={{ marginTop: 12 }}>
              Want to sell these to your clients?
            </h2>
            <p className="k-lead">Tell us a little about your business. We&apos;ll call you to set it up.</p>
            <div className="ks-actions">
              <Link href="/apply" className="k-btn k-btn--solid">
                Become a partner
              </Link>
              <Link href="/faq" className="k-btn k-btn--ghost">
                Read the questions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
