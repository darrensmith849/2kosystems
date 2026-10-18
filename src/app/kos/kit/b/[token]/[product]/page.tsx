import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KitProduct from "@/components/kos/KitProduct";
import { partnerFromToken } from "@/lib/kos/brand-token";
import { productByKey } from "@/lib/kos/catalogue";

type Params = Promise<{ token: string; product: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = productByKey((await params).product);
  return product ? { title: product.name, description: product.client.lead } : {};
}

export default async function Page({ params }: { params: Params }) {
  const { token, product: key } = await params;
  const partner = partnerFromToken(token);
  const product = productByKey(key);
  if (!partner || !product) notFound();
  return <KitProduct partner={partner} product={product} />;
}
