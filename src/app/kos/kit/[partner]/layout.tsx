import type { Metadata } from "next";
import KitShell from "@/components/kos/KitShell";
import { notFound } from "next/navigation";
import { PARTNERS, partnerBySlug } from "@/lib/kos/partners";

/**
 * Client pages ("the sales kit"): what a partner sends their own clients.
 * Nothing here names 2KO — the partner's name is the only brand. Kept out of
 * search engines; they're meant to be sent, not found.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return PARTNERS.map((partner) => ({ partner: partner.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ partner: string }> }): Promise<Metadata> {
  const partner = partnerBySlug((await params).partner);
  const name = partner?.demo ? "Your provider" : (partner?.name ?? "");
  return {
    title: { absolute: `Tools for your business · ${name}`, template: `%s · ${name}` },
    authors: [{ name }],
    creator: name,
    description: "Answer every message, fill your diary and look professional. Set up and looked after for you.",
    robots: { index: false, follow: false },
    openGraph: { siteName: name, url: undefined },
  };
}

export default async function KitLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ partner: string }>;
}) {
  const partner = partnerBySlug((await params).partner);
  if (!partner) notFound();
  return <KitShell partner={partner}>{children}</KitShell>;
}
