"use client";

import { CARD_FEE, PRODUCTS, rand, type ProductKey } from "@/lib/kos/catalogue";
import { useSequence } from "./useSequence";

/* A partner's month: clients sign up one by one under the partner's own
   brand, each payment splits on its own, and the partner's share adds up. */

const PICKS: { name: string; what: ProductKey[] }[] = [
  { name: "Studio Thandi", what: ["receptionist", "bookings"] },
  { name: "Kloof Physio", what: ["bookings", "business-email"] },
  { name: "Mo's Plumbing", what: ["receptionist"] },
  { name: "The Bread Shed", what: ["business-email", "bookings"] },
  { name: "Green Paws Vet", what: ["receptionist", "bookings", "business-email"] },
];

// Each client pays the suggested price; the partner keeps what's left after
// our wholesale price and the card fee.
const CLIENTS = PICKS.map((pick) => {
  const items = pick.what.map((key) => PRODUCTS.find((p) => p.key === key)!);
  const pays = items.reduce((sum, p) => sum + p.suggested, 0);
  const wholesale = items.reduce((sum, p) => sum + p.wholesale, 0);
  const fee = pays * CARD_FEE.percent + CARD_FEE.fixed;
  return { name: pick.name, what: items.map((p) => p.name), pays, share: pays - wholesale - fee };
});

const DELAYS = [900, ...CLIENTS.map(() => 1300)];

export default function PartnerConsole({ partner = "Brightside Digital" }: { partner?: string }) {
  const { ref, step } = useSequence(DELAYS, 4200);
  const shown = Math.min(CLIENTS.length, step);
  const earned = CLIENTS.slice(0, shown).reduce((sum, c) => sum + c.share, 0);

  return (
    <div ref={ref} className="ks-console" role="img" aria-label="A partner's dashboard filling with clients and monthly earnings">
      <div className="ks-console-bar">
        <span className="ks-avatar">{partner.charAt(0)}</span>
        <b>{partner}</b>
        <small>Your brand, your prices</small>
      </div>
      <div className="ks-console-earn">
        <small>You keep this month</small>
        <span className="k-num">{rand(earned)}</span>
      </div>
      <ul className="ks-console-list">
        {CLIENTS.map((c, i) => (
          <li key={c.name} data-on={shown > i}>
            <span className="ks-console-name">
              <b>{c.name}</b>
              <small>{c.what.join(" · ")}</small>
            </span>
            <span className="ks-console-split">
              <small>Pays you {rand(c.pays)}</small>
              <b>+{rand(c.share)}</b>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
