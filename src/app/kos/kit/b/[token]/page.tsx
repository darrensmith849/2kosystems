import KitHome from "@/components/kos/KitHome";
import { partnerFromToken } from "@/lib/kos/brand-token";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  return <KitHome partner={partnerFromToken((await params).token)!} />;
}
