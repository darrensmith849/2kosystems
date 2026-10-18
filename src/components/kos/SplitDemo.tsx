"use client";

import { cardFee, productByKey, rand } from "@/lib/kos/catalogue";
import { useSequence } from "./useSequence";

/* One client's monthly payment, splitting on its own: our price to us, the
   card fee to the bank, the rest to the partner. Real numbers from the
   catalogue, at our suggested price for Receptionist. */

const product = productByKey("receptionist")!;
const PAYS = product.suggested;
const OURS = product.wholesale;
const FEE = cardFee(PAYS);
const YOURS = PAYS - OURS - FEE;

const pct = (n: number) => `${((n / PAYS) * 100).toFixed(2)}%`;

const DELAYS = [900, 1300, 1600, 1400];

export default function SplitDemo({ partner = "Brightside Digital", client = "Studio Thandi" }: { partner?: string; client?: string }) {
  const { ref, step } = useSequence(DELAYS, 4200);
  const paid = step >= 1;
  const split = step >= 2;
  const landed = step >= 3;

  return (
    <div ref={ref} className="ks-split-demo" role="img" aria-label={`${client} pays ${rand(PAYS)}. ${rand(OURS)} goes to 2KO Systems, about ${rand(FEE)} is the card fee, and ${rand(YOURS)} goes to ${partner}.`}>
      <div className="ks-split-pay" data-on={paid}>
        <span className="ks-avatar">{client.charAt(0)}</span>
        <span>
          <small>{client} pays {partner}</small>
          <b>
            {rand(PAYS)} <em>for {product.name}</em>
          </b>
        </span>
        <span className="ks-split-card">Card</span>
      </div>

      <div className="ks-split-bar" data-split={split}>
        <span className="ks-split-seg ks-split-seg--you" style={{ width: split ? pct(YOURS) : "100%" }} />
        <span className="ks-split-seg ks-split-seg--fee" style={{ width: split ? pct(FEE) : "0%" }} />
        <span className="ks-split-seg ks-split-seg--us" style={{ width: split ? pct(OURS) : "0%" }} />
      </div>

      <div className="ks-split-legs" data-on={landed}>
        <div className="ks-split-leg ks-split-leg--you">
          <small>To {partner}</small>
          <b>{rand(YOURS)}</b>
          <span>Straight to your bank account</span>
        </div>
        <div className="ks-split-leg">
          <small>Card fee</small>
          <b>{rand(FEE)}</b>
          <span>To the bank</span>
        </div>
        <div className="ks-split-leg ks-split-leg--us">
          <small>To 2KO Systems</small>
          <b>{rand(OURS)}</b>
          <span>Our price</span>
        </div>
      </div>
    </div>
  );
}
