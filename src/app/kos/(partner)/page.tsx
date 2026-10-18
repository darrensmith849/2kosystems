import type { Metadata } from "next";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import ClientAsks from "@/components/kos/ClientAsks";
import KitPreview from "@/components/kos/KitPreview";
import PartnerConsole from "@/components/kos/PartnerConsole";
import ProductShowcase from "@/components/kos/ProductShowcase";
import SplitDemo from "@/components/kos/SplitDemo";
import { LANDING_PAGE, PRICE_NOTE, PRODUCTS, partnerKeeps, productByKey, rand } from "@/lib/kos/catalogue";
import { KOS_FAQ } from "@/lib/kos/faq";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* The partner home page. Written so a 12-year-old gets it: what you sell,
   how you get paid, what you do, what we do. */

const FACTS = [
  { b: "3 tools", s: "every small business asks for" },
  { b: "Your name", s: "on every page and message" },
  { b: "Paid on its own", s: "each card payment splits" },
  { b: "No tech work", s: "we set it up and run it" },
];

const STEPS = [
  {
    h: "Pick what to sell",
    p: "Choose the tools that fit your clients. Set your own price for each, above ours.",
    art: "price",
  },
  {
    h: "Send your client the page",
    p: "Every tool has a page with your name on it. Send the link. They ask you about it.",
    art: "link",
  },
  {
    h: "Get paid every month",
    p: "Your client pays by card. Our part comes to us, the rest goes to your bank. Nobody sends invoices.",
    art: "paid",
  },
] as const;

const WHO = [
  { h: "Marketing agencies", p: "You already run their social and ads. Now answer their messages and fill their diary too." },
  { h: "Web designers", p: "Add a monthly income to every site you build, and to clients who don't need a new site." },
  { h: "Consultants and bookkeepers", p: "You're the person they trust with their business. Fix the things that lose them customers." },
  { h: "IT support", p: "You already set up their laptops and email. Business email on Google is the natural first step." },
];

const ROADMAP = [
  { k: "Business email", s: "Ready first", p: "Sold and set up by a person from day one." },
  { k: "Bookings", s: "Next up", p: "With reminders and review requests built in." },
  { k: "Receptionist", s: "In build", p: "Waiting on WhatsApp approval from Meta for each client's number." },
];

function StepArt({ art }: { art: (typeof STEPS)[number]["art"] }) {
  if (art === "price") {
    return (
      <div className="ks-step-art" aria-hidden="true">
        {PRODUCTS.map((p) => (
          <span key={p.key} className="ks-step-chip">
            {p.name}
            <b>{rand(p.suggested)}</b>
          </span>
        ))}
      </div>
    );
  }
  if (art === "link") {
    return (
      <div className="ks-step-art" aria-hidden="true">
        <span className="ks-step-bubble">
          Hi Thandi, have a look at this. It answers your WhatsApp at night.
          <u>Brightside Digital · Receptionist</u>
        </span>
      </div>
    );
  }
  const r = productByKey("receptionist")!;
  return (
    <div className="ks-step-art" aria-hidden="true">
      <span className="ks-step-bank">
        <small>Brightside Digital · bank</small>
        <b>+{rand(partnerKeeps(r.suggested, r.wholesale))}</b>
        <small>Studio Thandi · Receptionist</small>
      </span>
    </div>
  );
}

export default function KosHome() {
  return (
    <>
      {/* 1. What is this? */}
      <section className="k-shell ks-hero ks-hero--home">
        <div>
          <Rise>
            <p className="k-mono k-mono--ember">For agencies, web designers and consultants</p>
            <h1 className="k-hero">
              Sell our tools
              <br />
              <span className="ks-hl">under your own name.</span>
            </h1>
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
              <Link href="#money" className="k-btn k-btn--ghost">
                See what you&apos;d earn
              </Link>
            </div>
            <p className="ks-note">No sign-up fee. You only pay us for clients who pay you.</p>
          </Rise>
        </div>
        <div className="ks-visual">
          <PartnerConsole />
        </div>
      </section>

      <div className="k-shell">
        <ul className="ks-facts-strip">
          {FACTS.map((f) => (
            <li key={f.b}>
              <b>{f.b}</b>
              <span>{f.s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. Why would I? */}
      <section className="k-band">
        <div className="k-shell ks-two">
          <Rise>
            <p className="k-mono k-mono--ember">Your clients already ask</p>
            <h2 className="k-title">They want these things. Until now, you said no.</h2>
            <p className="k-lead">
              Small businesses lose customers in the same three places: messages nobody answers, bookings made by phone,
              and an email address that looks like a hobby. They ask you to fix it because they trust you.
            </p>
            <p className="k-lead">Now you can say yes, under your own name, without building anything.</p>
          </Rise>
          <div className="ks-visual">
            <ClientAsks />
          </div>
        </div>
      </section>

      {/* 3. What can I sell? */}
      <section className="k-band k-hairline" id="products">
        <div className="k-shell">
          <div className="ks-head">
            <p className="k-mono k-mono--ember">What you can sell</p>
            <h2 className="k-title">Three tools. Each one does one job.</h2>
            <p className="k-lead">None of them need a website. Sell one, or all three to the same client.</p>
          </div>
          <ProductShowcase />
          <div className="ks-free">
            <span className="ks-tag">Free</span>
            <span>
              <b>{LANDING_PAGE.name}.</b> {LANDING_PAGE.line}
            </span>
          </div>
        </div>
      </section>

      {/* 4. How does it work? */}
      <section className="k-band k-hairline" id="how">
        <div className="k-shell">
          <div className="ks-head">
            <p className="k-mono k-mono--ember">How it works</p>
            <h2 className="k-title">Three steps. No tech work for you.</h2>
          </div>
          <ol className="ks-flow">
            {STEPS.map((s, i) => (
              <li key={s.h}>
                <StepArt art={s.art} />
                <span className="ks-flow-n">{i + 1}</span>
                <b>{s.h}</b>
                <span>{s.p}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. How do I get paid? */}
      <section className="k-band k-hairline" id="money">
        <div className="k-shell">
          <div className="ks-two">
            <Rise>
              <p className="k-mono k-mono--ember">How you get paid</p>
              <h2 className="k-title">Every payment splits on its own.</h2>
              <p className="k-lead">
                Your client pays you by card, once a month. The payment splits the moment it&apos;s made: our price comes
                to us, the rest goes straight to your bank. You never chase us, and we never chase you.
              </p>
              <ul className="ks-list">
                <li>You set the price. It just has to be above ours.</li>
                <li>One card payment per client a month, whatever they buy</li>
                <li>Your dashboard shows every payment and every split</li>
              </ul>
            </Rise>
            <div className="ks-visual">
              <SplitDemo />
            </div>
          </div>

          <div className="ks-price" id="pricing">
            <div className="ks-price-head">
              <span>Tool</span>
              <span>Our price to you</span>
              <span>We suggest you charge</span>
              <span>You keep</span>
            </div>
            {PRODUCTS.map((p) => (
              <Link key={p.key} href={`/${p.key}`} className="ks-price-row">
                <span className="ks-price-name">
                  <b>{p.name}</b>
                  <small>{p.unit}</small>
                </span>
                <span data-label="Our price">{rand(p.wholesale)}</span>
                <span data-label="You charge">{rand(p.suggested)}</span>
                <span data-label="You keep" className="ks-price-keep">
                  {rand(partnerKeeps(p.suggested, p.wholesale))}
                </span>
              </Link>
            ))}
            <div className="ks-price-row ks-price-row--free">
              <span className="ks-price-name">
                <b>{LANDING_PAGE.name}</b>
                <small>with any tool</small>
              </span>
              <span data-label="Our price">Free</span>
              <span data-label="You charge">Free</span>
              <span data-label="You keep">—</span>
            </div>
          </div>
          <p className="ks-note">
            Per client, after the card fee. {PRICE_NOTE}
          </p>
          <div className="ks-actions">
            <Link href="/earn" className="k-btn k-btn--solid">
              Work out what you&apos;d earn
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Will my clients see you? */}
      <section className="ks-dark">
        <div className="k-shell ks-two">
          <Rise>
            <p className="k-mono k-mono--ember">What your clients see</p>
            <h2 className="k-title">Your name. Never ours.</h2>
            <p className="k-lead">
              Every page, message and login your client sees carries your name and your colours. They know you, not us.
              The only place we appear is the small print on the card receipt, because the law asks for it.
            </p>
            <div className="ks-actions">
              <Link href="/kit/demo" className="k-link">
                Open a client page →
              </Link>
            </div>
          </Rise>
          <div className="ks-visual">
            <KitPreview />
          </div>
        </div>
      </section>

      {/* 7. Who does what? */}
      <section className="k-band">
        <div className="k-shell">
          <div className="ks-head">
            <p className="k-mono k-mono--ember">Who does what</p>
            <h2 className="k-title">You sell it. We do the work.</h2>
          </div>
          <div className="ks-split">
            <div>
              <p className="k-mono">You</p>
              <ul className="ks-list">
                <li>Sell it to your clients</li>
                <li>Tell us about the business</li>
                <li>Be their first call</li>
              </ul>
            </div>
            <div className="ks-us">
              <p className="k-mono k-mono--ember">Us, in the background</p>
              <ul className="ks-list">
                <li>Set every tool up</li>
                <li>Keep it running, and fix it when it breaks</li>
                <li>Answer the questions you can&apos;t</li>
                <li>Send the reminders, the review requests and the receipts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Is this for me? */}
      <section className="k-band k-hairline">
        <div className="k-shell">
          <div className="ks-head">
            <p className="k-mono k-mono--ember">Who it&apos;s for</p>
            <h2 className="k-title">Anyone small businesses already trust.</h2>
          </div>
          <div className="ks-grid4">
            {WHO.map((w) => (
              <div key={w.h} className="ks-card">
                <h3>{w.h}</h3>
                <p>{w.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. What's ready? */}
      <section className="k-band k-hairline">
        <div className="k-shell">
          <div className="ks-head">
            <p className="k-mono k-mono--ember">Where we are</p>
            <h2 className="k-title">We&apos;re signing our first partners now.</h2>
            <p className="k-lead">Here&apos;s what&apos;s ready and what&apos;s coming. You get each tool as soon as it is.</p>
          </div>
          <ol className="ks-road">
            {ROADMAP.map((r, i) => (
              <li key={r.k} data-now={i === 0}>
                <span className="ks-road-dot" />
                <small>{r.s}</small>
                <b>{r.k}</b>
                <span>{r.p}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 10. Questions */}
      <section className="k-band k-hairline" id="faq">
        <div className="k-shell">
          <div className="ks-head">
            <p className="k-mono k-mono--ember">Questions</p>
            <h2 className="k-title">Simple answers.</h2>
          </div>
          <div className="ks-faq" style={{ maxWidth: 820 }}>
            {KOS_FAQ.slice(0, 7).map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
          <div className="ks-actions">
            <Link href="/faq" className="k-link">
              All the questions →
            </Link>
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
            <p className="k-lead">Tell us a little about your business. It takes two minutes, and we&apos;ll call you back.</p>
            <div className="ks-actions">
              <Link href="/apply" className="k-btn k-btn--solid">
                Become a partner
              </Link>
              <Link href="/kit/demo" className="k-btn k-btn--ghost">
                See a client page
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
