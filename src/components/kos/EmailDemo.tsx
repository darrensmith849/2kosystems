"use client";

import { useSequence } from "./useSequence";

/* A business card loses its Gmail address and gets one with the business
   name in it. Then the replies start arriving on the phone. */

const OLD = "thandi.hair84@gmail.com";
const NEW = "thandi@studiothandi.co.za";
const INBOX = [
  { from: "Lerato M.", line: "Can I book for Friday?" },
  { from: "Bank", line: "Your statement is ready" },
  { from: "Supplier", line: "Your order is on its way" },
];

// Rub out the old address, type the new one, then three emails arrive.
const ERASE = 8;
const TYPE = 12;
const DELAYS = [1300, ...Array(ERASE).fill(70), 400, ...Array(TYPE).fill(85), 900, 900, 900];

export default function EmailDemo() {
  const { ref, step } = useSequence(DELAYS, 3400);
  const erase = Math.min(ERASE, Math.max(0, step - 1));
  const typing = Math.max(0, step - 2 - ERASE);
  const typed = Math.min(TYPE, typing);
  const arrived = Math.max(0, step - 2 - ERASE - TYPE);

  const address =
    typing === 0
      ? OLD.slice(0, Math.round(OLD.length * (1 - erase / ERASE)))
      : NEW.slice(0, Math.round((NEW.length * typed) / TYPE));
  const done = typed === TYPE;

  return (
    <div ref={ref} className="ks-mail" role="img" aria-label="A business card changing from a Gmail address to a business email address, with emails arriving">
      <div className="ks-bcard">
        <span className="ks-bcard-mark">ST</span>
        <b>Thandi Dube</b>
        <small>Studio Thandi · Hair &amp; colour</small>
        <span className="ks-bcard-line" data-done={done}>
          {address}
          <i className="ks-caret" />
        </span>
      </div>

      <div className="ks-inbox">
        <div className="ks-inbox-head">
          <b>Inbox</b>
          <small>{done ? NEW : "…"}</small>
        </div>
        {INBOX.map((m, i) => (
          <div key={m.from} className="ks-inbox-row" data-on={arrived > i}>
            <span className="ks-avatar ks-avatar--sm">{m.from.charAt(0)}</span>
            <span>
              <b>{m.from}</b>
              <small>{m.line}</small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
