import type { Metadata } from "next";
import Link from "next/link";
import BrandBuilder from "@/components/kos/BrandBuilder";

export const metadata: Metadata = {
  title: "See it with your name",
  description: "Type your business name and see the client pages carry your brand. Send the link to a client.",
  alternates: { canonical: "/try" },
};

export default function TryPage() {
  return (
    <>
      <section className="k-shell" style={{ paddingBlock: "clamp(56px, 8vw, 104px) 32px" }}>
        <div className="ks-head">
          <p className="k-mono k-mono--ember">See it with your name</p>
          <h1 className="k-state" style={{ marginTop: 14 }}>
            Your client pages, with your name on them.
          </h1>
          <p className="k-lead">
            Type your business name and pick your colour. The pages your clients see change straight away. Send the link
            to a client today. Nothing to sign up for.
          </p>
        </div>
      </section>
      <section className="k-shell" style={{ paddingBottom: "var(--band)" }}>
        <BrandBuilder />
        <p className="ks-note" style={{ marginTop: 24 }}>
          We don&apos;t keep what you type here: it lives in the link. When you{" "}
          <Link href="/apply" className="k-link">
            become a partner
          </Link>
          , your pages also get your logo and your own prices.
        </p>
      </section>
    </>
  );
}
