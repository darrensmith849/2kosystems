import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KitProduct from "@/components/kos/KitProduct";
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

export default async function Page({ params }: { params: Params }) {
  const { partner: slug, product: key } = await params;
  const partner = partnerBySlug(slug);
  const product = productByKey(key);
  if (!partner || !product) notFound();
  return <KitProduct partner={partner} product={product} />;
}
