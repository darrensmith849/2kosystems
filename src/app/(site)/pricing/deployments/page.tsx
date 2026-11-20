import type { Metadata } from "next";
import DeploymentPricing from "@/components/cinema/DeploymentPricing";

/**
 * Deployment pricing, under review. Reachable only by its link: it is not in
 * the menus, the sitemap or the pricing tabs, and search engines are asked
 * not to index it until it is signed off.
 */
export const metadata: Metadata = {
  title: "Deployment pricing",
  description: "Lean Six Sigma deployments priced per year: the recommended mix of online, hybrid and live training, or one format for everyone.",
  robots: { index: false, follow: false, nocache: true },
};

export default function DeploymentPricingPage() {
  return (
    <section className="k-shell dp-page">
      <header className="dp-intro">
        <p className="k-mono k-mono--ember">Pricing · Deployments</p>
        <h1>Choose how your people learn. The bigger it gets, the less each person costs.</h1>
      </header>
      <DeploymentPricing />
    </section>
  );
}
