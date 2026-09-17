import type { Metadata } from "next";
import PricingTabs from "@/components/cinema/PricingTabs";
import { RATES } from "@/lib/pricing";
import { completePageMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = completePageMetadata({
  title: "Pricing — Retainers, Training, Systems & Sigmafy",
  description: `Compare every way to work with 2KO: managed systems from ${RATES.managedSystems} per month, integrated improvement partnerships, training, Sigmafy Statistics, consulting, automation and websites.`,
  alternates: { canonical: "/pricing" },
});

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const category = (await searchParams).category;
  return <PricingTabs initialCategory={typeof category === "string" ? category : undefined} />;
}
