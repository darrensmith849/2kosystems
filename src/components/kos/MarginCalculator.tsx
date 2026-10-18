"use client";

import { useState } from "react";
import { PRICE_NOTE, PRODUCTS, cardFee, rand, type ProductKey } from "@/lib/kos/catalogue";

/* Pick what you sell, set your price, say how many clients. Shows what you
   keep each month after our price and the card fee. One card charge per
   client per month, whatever they buy. */

export default function MarginCalculator() {
  const [on, setOn] = useState<Record<ProductKey, boolean>>({
    receptionist: true,
    bookings: true,
    "business-email": false,
  });
  const [price, setPrice] = useState<Record<ProductKey, number>>(
    Object.fromEntries(PRODUCTS.map((p) => [p.key, p.suggested])) as Record<ProductKey, number>,
  );
  const [clients, setClients] = useState(10);

  const picked = PRODUCTS.filter((p) => on[p.key]);
  const charge = picked.reduce((sum, p) => sum + price[p.key], 0);
  const wholesale = picked.reduce((sum, p) => sum + p.wholesale, 0);
  const fee = picked.length ? cardFee(charge) : 0;
  const perClient = charge - wholesale - fee;
  const monthly = perClient * clients;

  return (
    <div className="ks-calc">
      <div className="ks-calc-rows">
        {PRODUCTS.map((p) => {
          const low = price[p.key] < p.wholesale;
          return (
            <div key={p.key} className="ks-calc-row" data-on={on[p.key]}>
              <label className="ks-calc-pick">
                <input
                  type="checkbox"
                  checked={on[p.key]}
                  onChange={(e) => setOn({ ...on, [p.key]: e.target.checked })}
                />
                <span>
                  <b>{p.name}</b>
                  <small>
                    Our price {rand(p.wholesale)} {p.unit}
                  </small>
                </span>
              </label>
              <label className="ks-calc-price">
                <small>You charge</small>
                <span>
                  R
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={10}
                    value={price[p.key]}
                    disabled={!on[p.key]}
                    aria-label={`Your price for ${p.name}`}
                    onChange={(e) => setPrice({ ...price, [p.key]: Math.max(0, Number(e.target.value) || 0) })}
                  />
                </span>
                {low && on[p.key] ? <em>That&apos;s below our price</em> : null}
              </label>
            </div>
          );
        })}
      </div>

      <label className="ks-calc-clients">
        <span>
          <b className="k-num">{clients}</b> clients
        </span>
        <input
          type="range"
          min={1}
          max={100}
          value={clients}
          onChange={(e) => setClients(Number(e.target.value))}
          aria-label="Number of clients"
        />
      </label>

      <div className="ks-calc-out">
        <div>
          <small>Each client pays you</small>
          <b className="k-num">{rand(charge)}</b>
        </div>
        <div>
          <small>You keep, per client</small>
          <b className="k-num">{rand(perClient)}</b>
        </div>
        <div className="ks-calc-total">
          <small>You keep, every month</small>
          <b className="k-num">{rand(monthly)}</b>
        </div>
      </div>
      <p className="k-sm ks-calc-note">
        After our price and the card fee (about 3.5%). Business email is counted as one mailbox per client. {PRICE_NOTE}
      </p>
    </div>
  );
}
