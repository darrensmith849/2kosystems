"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { PRODUCTS, partnerKeeps, rand, type ProductKey } from "@/lib/kos/catalogue";
import BookingsDemo from "./BookingsDemo";
import EmailDemo from "./EmailDemo";
import ReceptionistDemo from "./ReceptionistDemo";

/* The three products as tabs, each with its live demo on the stage. Moves
   on by itself until someone picks a tab; then it stays where they put it. */

const DEMO: Record<ProductKey, () => React.ReactNode> = {
  receptionist: () => <ReceptionistDemo />,
  bookings: () => <BookingsDemo />,
  "business-email": () => <EmailDemo />,
};

const ROTATE_MS = 14000;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function ProductShowcase() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const still = useSyncExternalStore(() => () => {}, reduced, () => true);

  useEffect(() => {
    if (held || still) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % PRODUCTS.length), ROTATE_MS);
    return () => window.clearTimeout(t);
  }, [active, held, still]);

  const p = PRODUCTS[active];

  return (
    <div className="ks-show">
      <div className="ks-show-tabs" role="tablist" aria-label="Products">
        {PRODUCTS.map((item, i) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            className="ks-show-tab"
            onClick={() => {
              setActive(i);
              setHeld(true);
            }}
          >
            <span className="ks-show-tab-top">
              <b>{item.name}</b>
              <span className="ks-tag">{item.status}</span>
            </span>
            <small>{item.line}</small>
            {i === active && !held && !still ? <i className="ks-show-bar" key={active} /> : null}
          </button>
        ))}
      </div>

      <div className="ks-show-stage" role="tabpanel" aria-label={p.name}>
        <div className="ks-show-demo" key={p.key}>
          {DEMO[p.key]()}
        </div>
        <div className="ks-show-info">
          <p className="k-mono k-mono--ember">What your client gets</p>
          <ul className="ks-list">
            {p.gets.slice(0, 4).map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
          <div className="ks-show-money">
            <span>
              <small>Our price</small>
              <b>{rand(p.wholesale)}</b>
            </span>
            <span>
              <small>You charge</small>
              <b>~{rand(p.suggested)}</b>
            </span>
            <span className="ks-gold">
              <small>You keep</small>
              <b>{rand(partnerKeeps(p.suggested, p.wholesale))}</b>
            </span>
          </div>
          <small className="ks-show-unit">{p.unit}, per client</small>
          <div className="ks-actions" style={{ marginTop: 18 }}>
            {p.key === "receptionist" ? (
              <Link href="/receptionist#try" className="k-link">
                Talk to it now →
              </Link>
            ) : null}
            <Link href={`/${p.key}`} className="k-link">
              All about {p.name.toLowerCase()} →
            </Link>
            <Link href={`/kit/demo/${p.key}`} className="k-link">
              What your client sees →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
