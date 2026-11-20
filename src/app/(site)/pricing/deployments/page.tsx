import type { Metadata } from "next";
import DeploymentPricing from "@/components/cinema/DeploymentPricing";
import PageHero from "@/components/cinema/PageHero";

/**
 * Deployment pricing, under review. Reachable only by its link: it is not in
 * the menus, the sitemap or the pricing tabs, and search engines are asked
 * not to index it until it is signed off.
 */
export const metadata: Metadata = {
  title: "Deployment pricing",
  description: "Lean Six Sigma deployments: online for every delegate, plus a yearly bank of live trainer hours spent your way.",
  robots: { index: false, follow: false, nocache: true },
};

export default function DeploymentPricingPage() {
  return (
    <>
      <PageHero
        eyebrow="PRICING · DEPLOYMENTS"
        title="Online for everyone. Live trainer hours, spent your way."
        titleClass="max-w-[18ch]"
        lead="Every tier includes a yearly bank of live hours. Use them on any belt, in any format."
      />
      <section className="k-band">
        <div className="k-shell">
          <DeploymentPricing />
        </div>
      </section>
    </>
  );
}
