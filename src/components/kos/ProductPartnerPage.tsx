import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import { LANDING_PAGE, PRICE_NOTE, partnerKeeps, rand, type Product } from "@/lib/kos/catalogue";
import ProductDemo from "./ProductDemo";
import ReceptionistChat from "./ReceptionistChat";
import BookingTryLazy from "./BookingTryLazy";
import EmailTry from "./EmailTry";

/** The partner's view of one product: what it is, who does what, the money. */
export default function ProductPartnerPage({ product }: { product: Product }) {
  const keep = partnerKeeps(product.suggested, product.wholesale);

  return (
    <>
      <section className="k-shell ks-hero">
        <div>
          <Rise>
            <span className="ks-tag">{product.status}</span>
            <h1 className="k-hero">{product.name}</h1>
            <p className="k-sub" style={{ marginTop: 16, color: "var(--warm-70)" }}>
              {product.line}
            </p>
          </Rise>
          <Rise step={1}>
            <div className="ks-actions">
              <Link href="#try" className="k-btn k-btn--solid">
                {product.key === "receptionist" ? "Talk to it now" : product.key === "bookings" ? "Book a slot now" : "See an address now"}
              </Link>
              <Link href={`/kit/demo/${product.key}`} className="k-btn k-btn--ghost">
                Show your client →
              </Link>
              <Link href="/apply" className="k-btn k-btn--ghost">
                Become a partner
              </Link>
            </div>
          </Rise>
        </div>
        <div className="ks-visual">
          <ProductDemo k={product.key} />
        </div>
      </section>

      {product.key === "bookings" ? (
        <section className="k-band k-hairline" id="try">
          <div className="k-shell">
            <div className="ks-head">
              <p className="k-mono k-mono--ember">Try it yourself</p>
              <h2 className="k-title">Book a slot, the way a customer would.</h2>
              <p className="k-lead">Then see every message that one booking sets off, with real dates.</p>
            </div>
            <div style={{ marginTop: 32 }}>
              <BookingTryLazy />
            </div>
          </div>
        </section>
      ) : null}

      {product.key === "business-email" ? (
        <section className="k-band k-hairline" id="try">
          <div className="k-shell">
            <div className="ks-head">
              <p className="k-mono k-mono--ember">Try it yourself</p>
              <h2 className="k-title">What would your client&apos;s email look like?</h2>
              <p className="k-lead">Type a business name, or the website they already have. We&apos;ll show the addresses that could be theirs.</p>
            </div>
            <div style={{ marginTop: 32 }}>
              <EmailTry />
            </div>
          </div>
        </section>
      ) : null}

      {product.key === "receptionist" ? (
        <section className="k-band k-hairline" id="try">
          <div className="k-shell">
            <div className="ks-head">
              <p className="k-mono k-mono--ember">Try it yourself</p>
              <h2 className="k-title">Talk to it. Then try it as your client&apos;s business.</h2>
              <p className="k-lead">
                This is the real thing answering, not a recording. Ask what a customer would ask, book a time, or ask
                for something it doesn&apos;t do.
              </p>
            </div>
            <div style={{ marginTop: 32 }}>
              <ReceptionistChat />
            </div>
          </div>
        </section>
      ) : null}

      <section className="k-band k-hairline">
        <div className="k-shell">
          <div className="ks-head">
            <p className="k-mono k-mono--ember">What your client gets</p>
            <h2 className="k-title">{product.client.title}</h2>
          </div>
          <ul className="ks-list" style={{ maxWidth: 620 }}>
            {product.gets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="k-band k-hairline">
        <div className="k-shell">
          <div className="ks-head">
            <p className="k-mono k-mono--ember">Who does what</p>
            <h2 className="k-title">You sell it. We do the work.</h2>
          </div>
          <div className="ks-split">
            <div>
              <p className="k-mono">You</p>
              <ul className="ks-list">
                {product.youDo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="ks-us">
              <p className="k-mono k-mono--ember">Us, in the background</p>
              <ul className="ks-list">
                {product.weDo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="ks-facts">
            <div>
              <small>Set-up</small>
              <span>{product.setup}</span>
            </div>
            <div>
              <small>Your client needs</small>
              <span>{product.needs}</span>
            </div>
            <div>
              <small>No website?</small>
              <span>{LANDING_PAGE.line}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="k-band k-hairline">
        <div className="k-shell">
          <div className="ks-head">
            <p className="k-mono k-mono--ember">The money</p>
            <h2 className="k-title">You set the price. You keep the difference.</h2>
            <p className="k-lead">
              Your client pays you by card. The payment splits on its own: our part comes to us, the rest goes straight
              to you.
            </p>
          </div>
          <div className="ks-facts">
            <div>
              <small>Our price to you</small>
              <b>{rand(product.wholesale)}</b>
              <span>{product.unit}</span>
            </div>
            <div>
              <small>We suggest you charge</small>
              <b>{rand(product.suggested)}</b>
              <span>{product.unit}</span>
            </div>
            <div className="ks-gold">
              <small>You keep</small>
              <b>{rand(keep)}</b>
              <span>per client, after the card fee</span>
            </div>
          </div>
          <p className="ks-note">{PRICE_NOTE}</p>
          <div className="ks-actions">
            <Link href="/earn" className="k-link">
              Work out what you&apos;d earn →
            </Link>
          </div>
        </div>
      </section>

      <section className="k-band">
        <div className="k-shell">
          <div className="ks-cta-band">
            <h2 className="k-title">See what your client sees.</h2>
            <p className="k-lead">
              A page about {product.name.toLowerCase()} with your name on it, not ours. Send the link, and they ask you
              about it.
            </p>
            <div className="ks-actions">
              <Link href={`/kit/demo/${product.key}`} className="k-btn k-btn--solid">
                Open the client page
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
