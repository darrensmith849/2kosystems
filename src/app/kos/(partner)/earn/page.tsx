import type { Metadata } from "next";
import Link from "next/link";
import MarginCalculator from "@/components/kos/MarginCalculator";
import { CARD_FEE, PRODUCTS, rand, type ProductKey } from "@/lib/kos/catalogue";

export const metadata: Metadata = {
  title: "How you earn",
  description: "Set your own price, and keep the difference every month. Work out what you'd earn.",
  alternates: { canonical: "/earn" },
};

const EXAMPLES: { who: string; clients: number; what: ProductKey[] }[] = [
  { who: "A web designer with 10 clients", clients: 10, what: ["business-email"] },
  { who: "A small agency with 25 clients", clients: 25, what: ["bookings", "business-email"] },
  { who: "An agency with 60 clients", clients: 60, what: ["receptionist", "bookings"] },
];

function monthly(clients: number, what: ProductKey[]) {
  const items = PRODUCTS.filter((p) => what.includes(p.key));
  const charge = items.reduce((s, p) => s + p.suggested, 0);
  const wholesale = items.reduce((s, p) => s + p.wholesale, 0);
  return clients * (charge - wholesale - (charge * CARD_FEE.percent + CARD_FEE.fixed));
}

export default function EarnPage() {
  return (
    <>
      <section className="k-shell" style={{ paddingBlock: "clamp(56px, 8vw, 104px) 32px" }}>
        <div className="ks-head">
          <p className="k-mono k-mono--ember">How you earn</p>
          <h1 className="k-state" style={{ marginTop: 14 }}>
            You set the price. You keep the difference.
          </h1>
          <p className="k-lead">
            We charge you one fixed price per tool, per client, each month. You charge your client whatever you like.
            Their card payment splits on its own, so you never chase us and we never chase you.
          </p>
        </div>
      </section>

      <section className="k-shell" style={{ paddingBottom: 32 }}>
        <MarginCalculator />
      </section>

      <section className="k-band k-hairline">
        <div className="k-shell">
          <div className="ks-head">
            <p className="k-mono k-mono--ember">Examples</p>
            <h2 className="k-title">At our suggested prices.</h2>
          </div>
          <div className="ks-grid3">
            {EXAMPLES.map((e) => (
              <div key={e.who} className="ks-card">
                <h3>{e.who}</h3>
                <p>Sells {PRODUCTS.filter((p) => e.what.includes(p.key)).map((p) => p.name.toLowerCase()).join(" and ")}.</p>
                <span className="ks-card-foot">
                  <span>You keep each month</span>
                  <b style={{ color: "var(--ember)", fontSize: 20 }}>{rand(monthly(e.clients, e.what))}</b>
                </span>
              </div>
            ))}
          </div>
          <div className="ks-actions">
            <Link href="/apply" className="k-btn k-btn--solid">
              Become a partner
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
