import type { Metadata } from "next";
import PricingTabs from "@/components/cinema/PricingTabs";
import { RATES } from "@/lib/pricing";
import { completePageMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = completePageMetadata({
  title: "Pricing — Training, Partnerships & Sigmafy",
  description: `Lean and Six Sigma training from one cohort to the whole organisation, improvement partnerships from ${RATES.partnershipProgramme} per month, and Sigmafy Statistics.`,
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
