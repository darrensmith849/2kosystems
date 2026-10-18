import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import AskPartner from "@/components/kos/AskPartner";
import ProductDemo from "@/components/kos/ProductDemo";
import ReceptionistChat from "@/components/kos/ReceptionistChat";
import BookingTryLazy from "@/components/kos/BookingTryLazy";
import EmailTry from "@/components/kos/EmailTry";
import { PRODUCTS, type Product } from "@/lib/kos/catalogue";
import { kitBase, type Partner } from "@/lib/kos/partners";

/** One tool, for a partner's client. */
export default function KitProduct({ partner, product }: { partner: Partner; product: Product }) {
  const others = PRODUCTS.filter((p) => p.key !== product.key);

  return (
    <>
      <section className="k-shell ks-hero">
        <div>
          <Rise>
            <p className="k-mono k-mono--ember">{product.name}</p>
            <h1 className="k-hero" style={{ marginTop: 16 }}>
              {product.client.title}
            </h1>
            <p className="k-lead">{product.client.lead}</p>
            <ul className="ks-list">
              {product.client.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </Rise>
        </div>
        <div className="ks-visual">
          <ProductDemo k={product.key} />
        </div>
      </section>

      {product.key === "bookings" ? (
        <section className="k-shell" style={{ paddingBottom: 64 }} id="try">
          <div className="ks-head" style={{ marginBottom: 32 }}>
            <p className="k-mono k-mono--ember">Try it yourself</p>
            <h2 className="k-title">Book a slot, the way your customers would.</h2>
            <p className="k-lead">Then see every message they get, with real dates.</p>
          </div>
          <BookingTryLazy />
        </section>
      ) : null}

      {product.key === "business-email" ? (
        <section className="k-shell" style={{ paddingBottom: 64 }} id="try">
          <div className="ks-head" style={{ marginBottom: 32 }}>
            <p className="k-mono k-mono--ember">Try it yourself</p>
            <h2 className="k-title">See what your address could be.</h2>
            <p className="k-lead">Type your business name, or the website you already have.</p>
          </div>
          <EmailTry />
        </section>
      ) : null}

      {product.key === "receptionist" ? (
        <section className="k-shell" style={{ paddingBottom: 64 }} id="try">
          <div className="ks-head" style={{ marginBottom: 32 }}>
            <p className="k-mono k-mono--ember">Try it yourself</p>
            <h2 className="k-title">Talk to it, as your customers would.</h2>
            <p className="k-lead">Ask it about a sample salon, or tell it a few things about your business and see how it answers.</p>
          </div>
          <ReceptionistChat partnerName={partner.name} />
        </section>
      ) : null}

      <section className="k-shell" style={{ paddingBottom: 48 }}>
        <AskPartner partner={partner} product={product} />
      </section>

      <section className="k-shell k-hairline" style={{ paddingBlock: 48 }}>
        <p className="k-mono">Also from {partner.name}</p>
        <div className="ks-grid3" style={{ marginTop: 18 }}>
          {others.map((p) => (
            <Link key={p.key} href={`${kitBase(partner)}/${p.key}`} className="ks-card">
              <h3>{p.name}</h3>
              <p>{p.client.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
