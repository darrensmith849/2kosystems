import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to the 2KO Systems team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="k-shell" style={{ paddingBlock: "clamp(56px, 8vw, 104px)" }}>
      <div className="ks-head">
        <p className="k-mono k-mono--ember">Contact</p>
        <h1 className="k-state" style={{ marginTop: 14 }}>
          Talk to us.
        </h1>
        <p className="k-lead">
          Want to sell our tools? The quickest way is the partner form. We read every one and call you back.
        </p>
        <div className="ks-actions">
          <Link href="/apply" className="k-btn k-btn--solid">
            Become a partner
          </Link>
          <a href="mailto:contact@2ko.co.za" className="k-btn k-btn--ghost">
            contact@2ko.co.za
          </a>
        </div>
      </div>
    </section>
  );
}
