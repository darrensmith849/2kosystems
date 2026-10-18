import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using the 2kosystems.com website.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <section className="k-shell" style={{ paddingBlock: "clamp(56px, 8vw, 104px)" }}>
      <div className="ks-prose">
        <p className="k-mono k-mono--ember">Terms</p>
        <h1 className="k-state" style={{ marginTop: 14 }}>
          Using this website.
        </h1>
        <p>
          This website explains what 2KO Systems offers partners. It is not an offer you can accept here, and nothing
          on it is a contract.
        </p>
        <h2>Prices</h2>
        <p>Prices on this site are proposals. We confirm them in writing when you join.</p>
        <h2>Becoming a partner</h2>
        <p>
          Partners sign a separate partner agreement before selling anything. That agreement, not this page, sets out
          prices, payments, support and responsibilities.
        </p>
        <h2>Client pages</h2>
        <p>
          The client pages on this site are examples a partner can send to their own clients. They describe the tools
          in general terms.
        </p>
      </div>
    </section>
  );
}
