import type { Metadata } from "next";
import ApplyForm from "@/components/kos/ApplyForm";

export const metadata: Metadata = {
  title: "Become a partner",
  description: "Sell an AI receptionist, online bookings and business email under your own name. Tell us about your business.",
  alternates: { canonical: "/apply" },
};

export default function ApplyPage() {
  return (
    <section className="k-shell ks-hero" style={{ alignItems: "start" }}>
      <div>
        <p className="k-mono k-mono--ember">Become a partner</p>
        <h1 className="k-state" style={{ marginTop: 14 }}>
          Tell us about your business.
        </h1>
        <p className="k-lead">Two minutes. We read every form and call you back within two working days.</p>
        <ul className="ks-list">
          <li>No sign-up fee</li>
          <li>You only pay for clients who pay you</li>
          <li>We help you sell to your first clients</li>
        </ul>
      </div>
      <ApplyForm />
    </section>
  );
}
