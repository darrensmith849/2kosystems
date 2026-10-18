import type { Metadata } from "next";
import ProductPartnerPage from "@/components/kos/ProductPartnerPage";
import { productByKey } from "@/lib/kos/catalogue";

const product = productByKey("business-email")!;

export const metadata: Metadata = {
  title: "Business email",
  description: product.line,
  alternates: { canonical: "/business-email" },
};

export default function Page() {
  return <ProductPartnerPage product={product} />;
}
