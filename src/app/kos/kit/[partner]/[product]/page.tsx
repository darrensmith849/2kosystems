import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Rise from "@/components/cinema/Rise";
import AskPartner from "@/components/kos/AskPartner";
import ProductDemo from "@/components/kos/ProductDemo";
import { PRODUCTS, productByKey } from "@/lib/kos/catalogue";
import { PARTNERS, partnerBySlug } from "@/lib/kos/partners";

export const dynamicParams = false;

export function generateStaticParams() {
  return PARTNERS.flatMap((partner) => PRODUCTS.map((p) => ({ partner: partner.slug, product: p.key })));
}

type Params = Promise<{ partner: string; product: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = productByKey((await params).product);
  return product ? { title: product.name, description: product.client.lead } : {};
}

export default async function KitProduct({ params }: { params: Params }) {
  const { partner: slug, product: key } = await params;
  const partner = partnerBySlug(slug);
  const product = productByKey(key);
  if (!partner || !product) notFound();
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

      <section className="k-shell" style={{ paddingBottom: 48 }}>
        <AskPartner partner={partner} product={product} />
      </section>

      <section className="k-shell k-hairline" style={{ paddingBlock: 48 }}>
        <p className="k-mono">Also from {partner.name}</p>
        <div className="ks-grid3" style={{ marginTop: 18 }}>
          {others.map((p) => (
            <Link key={p.key} href={`/kit/${partner.slug}/${p.key}`} className="ks-card">
              <h3>{p.name}</h3>
              <p>{p.client.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
