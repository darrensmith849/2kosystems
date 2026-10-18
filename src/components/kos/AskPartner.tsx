import { rand, type Product } from "@/lib/kos/catalogue";
import type { Partner } from "@/lib/kos/partners";

/** The end of every client page: who to ask, and how. Never mentions 2KO. */
export default function AskPartner({ partner, product }: { partner: Partner; product?: Product }) {
  const price = product ? partner.prices?.[product.key] : undefined;
  const subject = product ? `About ${product.name}` : "About your business tools";
  const ask = product ? `Ask ${partner.name} about ${product.name.toLowerCase()}.` : `Ask ${partner.name} about these.`;

  return (
    <div className="ks-ask">
      <div>
        <h2 className="k-title">{ask}</h2>
        <p className="k-lead" style={{ marginTop: 10 }}>
          They set it up for you and look after it. You don&apos;t have to do anything technical.
        </p>
        {price ? (
          <p className="ks-ask-price">
            <b>{rand(price)}</b> {product?.unit}
          </p>
        ) : null}
      </div>
      <div className="ks-actions" style={{ marginTop: 0 }}>
        {partner.demo ? (
          <>
            <span className="k-btn k-btn--solid" aria-disabled="true">
              Message your provider
            </span>
            <p className="k-sm" style={{ flexBasis: "100%" }}>
              This is a preview. Your partner&apos;s name, contact details and price go here.
            </p>
          </>
        ) : (
          <>
            {partner.whatsapp ? (
              <a className="k-btn k-btn--solid" href={`https://wa.me/${partner.whatsapp.replace(/\D/g, "")}`}>
                WhatsApp {partner.name}
              </a>
            ) : null}
            {partner.email ? (
              <a
                className={`k-btn ${partner.whatsapp ? "k-btn--ghost" : "k-btn--solid"}`}
                href={`mailto:${partner.email}?subject=${encodeURIComponent(subject)}`}
              >
                Email {partner.name}
              </a>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
