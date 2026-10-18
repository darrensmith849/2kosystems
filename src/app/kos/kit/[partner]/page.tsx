import KitHome from "@/components/kos/KitHome";
import { partnerBySlug } from "@/lib/kos/partners";

export default async function Page({ params }: { params: Promise<{ partner: string }> }) {
  return <KitHome partner={partnerBySlug((await params).partner)!} />;
}
