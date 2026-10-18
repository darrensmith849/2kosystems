import type { Metadata } from "next";
import Link from "next/link";
import { KOS_FAQ } from "@/lib/kos/faq";

export const metadata: Metadata = {
  title: "Questions",
  description: "Straight answers about selling 2KO Systems tools under your own name.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <section className="k-shell" style={{ paddingBlock: "clamp(56px, 8vw, 104px)" }}>
      <div className="ks-head">
        <p className="k-mono k-mono--ember">Questions</p>
        <h1 className="k-state" style={{ marginTop: 14 }}>
          Simple answers.
        </h1>
      </div>
      <div className="ks-faq" style={{ maxWidth: 820 }}>
        {KOS_FAQ.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
      <p className="k-sm" style={{ marginTop: 28 }}>
        Something else? <Link href="/contact" className="k-link">Ask us</Link>
      </p>
    </section>
  );
}
