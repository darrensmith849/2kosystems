import type { Metadata } from "next";
import ProductPartnerPage from "@/components/kos/ProductPartnerPage";
import { productByKey } from "@/lib/kos/catalogue";

const product = productByKey("receptionist")!;

export const metadata: Metadata = {
  title: "Receptionist",
  description: product.line,
  alternates: { canonical: "/receptionist" },
};

export default function Page() {
  return <ProductPartnerPage product={product} />;
}
