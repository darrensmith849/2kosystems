import Link from "next/link";
import type { Example } from "@/lib/websites";
import WebsiteWorkLinks from "./WebsiteWorkLinks";

const journey = ["Discover", "Choose", "Pay", "Confirm", "Fulfil", "Return"];

export default function CommerceWebsiteAnatomy({ examples }: { examples: Example[] }) {
  return (
    <div className="cwa-wrap">
      <figure className="cwa-canvas" aria-label="A shadow-state representation of an online commerce journey">
        <header className="cwa-head">
          <div><span>STOREFRONT</span><strong>Customer view</strong></div>
          <div className="cwa-journey">
            {journey.map((step, index) => <span key={step} className={index < 4 ? "is-live" : ""}>{index + 1}<small>{step}</small></span>)}
          </div>
          <div><span>OPERATIONS</span><strong>Business view</strong></div>
        </header>

        <section className="cwa-shop">
          <span className="cwa-marker">01 · DISCOVER AND CHOOSE</span>
          <div className="cwa-store-nav"><b>YOUR STORE</b><i /><i /><i /><span>Bag · 02</span></div>
          <div className="cwa-shop-layout">
            <aside><small>CATALOGUE</small><i /><i /><i /><i /></aside>
            <div className="cwa-products">
              {[1, 2, 3, 4].map((item) => <article key={item}><div /><span>PRODUCT {item}</span><strong>R0,000</strong></article>)}
            </div>
            <aside className="cwa-cart">
              <small>YOUR BAG</small>
              <p><i /><span>Product one</span><b>R0,000</b></p>
              <p><i /><span>Product two</span><b>R0,000</b></p>
              <div><span>TOTAL</span><strong>R0,000</strong></div>
              <button type="button" tabIndex={-1}>Checkout securely →</button>
            </aside>
          </div>
        </section>

        <section className="cwa-checkout">
          <span className="cwa-marker">02 · PAY WITHOUT DOUBT</span>
          <div className="cwa-checkout-copy">
            <small>CHECKOUT</small>
            <h3>Less friction.<br />More completed orders.</h3>
            <ul><li>Guest checkout</li><li>South African gateway</li><li>Shipping calculated</li><li>VAT handled</li></ul>
          </div>
          <div className="cwa-payment-card">
            <header><span>1 Details</span><span>2 Delivery</span><strong>3 Payment</strong></header>
            <div className="cwa-fields"><i /><i /><i /></div>
            <div className="cwa-pay-methods"><i>VISA</i><i>MC</i><i>EFT</i></div>
            <button type="button" tabIndex={-1}>Pay R0,000 securely</button>
            <small>🔒 Encrypted payment · your details stay private</small>
          </div>
        </section>

        <section className="cwa-order">
          <span className="cwa-marker">03 · THE SALE BECOMES AN ORDER</span>
          <div className="cwa-order-flow">
            <article><small>CUSTOMER</small><strong>Order confirmed</strong><span>Email · receipt · tracking</span></article>
            <b>→</b>
            <article><small>STORE</small><strong>Stock reserved</strong><span>Order · VAT · payment</span></article>
            <b>→</b>
            <article><small>TEAM</small><strong>Ready to fulfil</strong><span>Pick · pack · dispatch</span></article>
          </div>
          <div className="cwa-order-list">
            <header><span>ORDERS</span><span>PAYMENT</span><span>FULFILMENT</span><span>TOTAL</span></header>
            {["#1048", "#1047", "#1046"].map((order, index) => <p key={order}><strong>{order}</strong><span className="is-paid">Paid</span><span>{index === 0 ? "Packing" : "Complete"}</span><b>R{index + 2},450</b></p>)}
          </div>
        </section>

        <figcaption><span>The storefront is only the visible half.</span><span>Payments, stock, messages and fulfilment are part of the build.</span></figcaption>
      </figure>
      <WebsiteWorkLinks examples={examples} />
      <Link href="#included" className="lwa-continue">Continue to the written scope <span>↓</span></Link>
    </div>
  );
}
