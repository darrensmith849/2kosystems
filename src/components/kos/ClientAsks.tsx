"use client";

import { useSequence } from "./useSequence";

/* The partner's phone: three clients ask for the things these tools do.
   Then the partner answers the way they can now — yes. */

const ASKS = [
  { who: "Studio Thandi", what: "Can our WhatsApp answer people at night? We miss so many bookings." },
  { who: "Kloof Physio", what: "Is there a way for patients to book online, with reminders?" },
  { who: "Mo's Plumbing", what: "I still use a Gmail address. Can you sort out a proper one?" },
];

const DELAYS = [700, 1500, 1500, 1500, 1300];

export default function ClientAsks() {
  const { ref, step } = useSequence(DELAYS, 3800);
  const answered = step >= ASKS.length + 2;

  return (
    <div ref={ref} className="ks-asks" role="img" aria-label="Three clients asking their agency for a WhatsApp receptionist, online bookings and a business email, and the agency saying yes">
      <div className="ks-asks-head">
        <b>Messages</b>
        <small>Your clients</small>
      </div>
      {ASKS.map((a, i) => (
        <div key={a.who} className="ks-ask-row" data-on={step > i}>
          <span className="ks-avatar ks-avatar--sm">{a.who.charAt(0)}</span>
          <span>
            <b>{a.who}</b>
            <small>{a.what}</small>
          </span>
        </div>
      ))}
      <div className="ks-asks-reply" data-on={step > ASKS.length}>
        <span className="ks-asks-was" data-gone={answered}>&ldquo;Sorry, we don&apos;t do that.&rdquo;</span>
        <span className="ks-asks-now" data-on={answered}>
          &ldquo;Yes. We&apos;ll set it up this week.&rdquo;
        </span>
      </div>
    </div>
  );
}
