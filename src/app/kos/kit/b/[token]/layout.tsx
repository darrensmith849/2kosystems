import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KitShell from "@/components/kos/KitShell";
import { partnerFromToken } from "@/lib/kos/brand-token";

/**
 * Client pages for a brand carried in the link ("see it with your name"). Nothing is stored; the
 * partner's name, colour and contact come from the token. Same pages as /kit/<partner>, and like
 * them never indexed.
 */

type Params = Promise<{ token: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const partner = partnerFromToken((await params).token);
  const name = partner?.name ?? "";
  return {
    title: { absolute: `Tools for your business · ${name}`, template: `%s · ${name}` },
    description: "Answer every message, fill your diary and look professional. Set up and looked after for you.",
    robots: { index: false, follow: false },
    authors: [{ name }],
    creator: name,
    openGraph: { siteName: name, url: undefined },
  };
}

export default async function BrandLayout({ children, params }: { children: React.ReactNode; params: Params }) {
  const partner = partnerFromToken((await params).token);
  if (!partner) notFound();
  return <KitShell partner={partner}>{children}</KitShell>;
}
