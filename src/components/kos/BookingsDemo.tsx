"use client";

import { useSequence } from "./useSequence";

/* Someone taps "Book" on Google, a week fills up, and each booking gets its
   messages: confirmed, reminded, thanked, asked for a review. Every customer
   gets the same review request — that's Google's rule, and ours. */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// [day, row] cells that fill, in order.
const FILLS: [number, number][] = [
  [5, 1], [2, 0], [4, 2], [0, 1], [3, 3], [5, 0], [1, 2], [4, 0], [2, 3], [5, 2],
];
const MESSAGES = [
  { t: "Booked", p: "Saturday 11:30 is yours." },
  { t: "Day before", p: "See you tomorrow at 11:30." },
  { t: "After the visit", p: "Thanks for coming in!" },
  { t: "Two days later", p: "Would you leave us a Google review?" },
];

const DELAYS = [900, 700, ...FILLS.map(() => 260), 900, 900, 900, 900];

export default function BookingsDemo({ business = "Studio Thandi" }: { business?: string }) {
  const { ref, step } = useSequence(DELAYS, 3400);
  const filled = Math.max(0, Math.min(FILLS.length, step - 2));
  const sent = Math.max(0, step - 2 - FILLS.length);

  return (
    <div ref={ref} className="ks-book" role="img" aria-label="A booking button, a week filling with bookings, and the messages each customer gets">
      <div className="ks-gcard">
        <div>
          <b>{business}</b>
          <small>Hair salon · Open until 18:00</small>
        </div>
        <span className="ks-gbtn" data-press={step === 1}>Book</span>
      </div>

      <div className="ks-week">
        {DAYS.map((day, d) => (
          <div key={day} className="ks-day">
            <small>{day}</small>
            {[0, 1, 2, 3].map((row) => {
              const order = FILLS.findIndex(([fd, fr]) => fd === d && fr === row);
              return <span key={row} data-on={order >= 0 && order < filled} />;
            })}
          </div>
        ))}
      </div>
      <p className="ks-week-count">
        <span className="k-num">{filled}</span> booked this week
      </p>

      <ol className="ks-timeline">
        {MESSAGES.map((m, i) => (
          <li key={m.t} data-on={sent > i}>
            <small>{m.t}</small>
            <span>{m.p}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
