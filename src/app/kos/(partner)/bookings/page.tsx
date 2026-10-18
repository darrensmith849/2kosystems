import type { Metadata } from "next";
import ProductPartnerPage from "@/components/kos/ProductPartnerPage";
import { productByKey } from "@/lib/kos/catalogue";

const product = productByKey("bookings")!;

export const metadata: Metadata = {
  title: "Bookings",
  description: product.line,
  alternates: { canonical: "/bookings" },
};

export default function Page() {
  return <ProductPartnerPage product={product} />;
}
