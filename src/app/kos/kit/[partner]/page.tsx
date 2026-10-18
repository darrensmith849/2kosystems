import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import AskPartner from "@/components/kos/AskPartner";
import ProductDemo from "@/components/kos/ProductDemo";
import { PRODUCTS } from "@/lib/kos/catalogue";
import { partnerBySlug } from "@/lib/kos/partners";

export default async function KitHome({ params }: { params: Promise<{ partner: string }> }) {
  const partner = partnerBySlug((await params).partner)!;

  return (
    <>
      <section className="k-shell" style={{ paddingBlock: "clamp(56px, 8vw, 104px) 0", textAlign: "center" }}>
        <Rise>
          <p className="k-mono k-mono--ember">For your business</p>
          <h1 className="k-hero" style={{ marginTop: 16 }}>
            Never miss a customer again.
          </h1>
          <p className="k-lead" style={{ margin: "20px auto 0", maxWidth: "50ch" }}>
            Answer every message, fill your diary and look like the real business you are. Set up for you and looked
            after for you, by {partner.name}.
          </p>
        </Rise>
      </section>

      <section className="k-shell k-band">
        <div className="ks-kit-tools">
          {PRODUCTS.map((p) => (
            <div key={p.key} className="ks-kit-tool">
              <div>
                <p className="k-mono k-mono--ember">{p.name}</p>
                <h2 className="k-state" style={{ marginTop: 12 }}>
                  {p.client.title}
                </h2>
                <p className="k-lead" style={{ marginTop: 14 }}>
                  {p.client.lead}
                </p>
                <ul className="ks-list">
                  {p.client.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <div className="ks-actions">
                  <Link href={`/kit/${partner.slug}/${p.key}`} className="k-link">
                    More about {p.name.toLowerCase()} →
                  </Link>
                </div>
              </div>
              <div className="ks-visual">
                <ProductDemo k={p.key} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="k-shell" style={{ paddingBottom: "var(--band)" }}>
        <AskPartner partner={partner} />
      </section>
    </>
  );
}
