"use client";

import { useMemo, useState } from "react";

/* Book a slot at a sample salon, the way a customer would, then see every
   message that booking sets off — with real dates. Runs in the browser only:
   nothing is booked and nothing is sent. Labelled a demo. */

const SERVICES = [
  { name: "Wash, cut and blow-dry", price: 380, mins: 60 },
  { name: "Cut and colour", price: 650, mins: 120 },
  { name: "Full highlights", price: 820, mins: 150 },
  { name: "Kids' cut (under 12)", price: 180, mins: 30 },
];

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Day = { date: Date; times: string[]; taken: Set<string> };

/** The next six open days (closed Sunday and Monday), with some times already taken. */
function openDays(from: Date): Day[] {
  const out: Day[] = [];
  for (let d = 1; out.length < 6 && d < 14; d += 1) {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + d);
    const dow = date.getDay();
    if (dow === 0 || dow === 1) continue;
    const times = dow === 6 ? ["08:00", "09:30", "11:00", "12:30"] : ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30"];
    // A busy salon: about a third of the times are gone, the same ones each visit to the same day.
    const taken = new Set(times.filter((_, i) => (date.getDate() + i * 2) % 3 === 0));
    out.push({ date, times, taken });
  }
  return out;
}

const label = (d: Date) => `${DAY_LONG[d.getDay()]} ${d.getDate()} ${MONTH[d.getMonth()]}`;

function addDays(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export default function BookingTry() {
  const days = useMemo(() => openDays(new Date()), []);
  const [service, setService] = useState<number | null>(null);
  const [day, setDay] = useState(0);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [booked, setBooked] = useState(false);

  const s = service === null ? null : SERVICES[service];
  const d = days[day];
  const first = name.trim().split(/\s+/)[0] || "there";

  function reset() {
    setService(null);
    setTime(null);
    setBooked(false);
    setName("");
  }

  const messages =
    booked && s && time
      ? [
          { when: "Straight away", text: `Hi ${first}, you're booked: ${s.name} on ${label(d.date)} at ${time}. Reply C to cancel.` },
          { when: `${label(addDays(d.date, -1))}, 10:00`, text: `Hi ${first}, a reminder about tomorrow at ${time}. See you at Studio Thandi. Reply C if you can't make it.` },
          { when: `${label(d.date)}, after your visit`, text: `Thanks for coming in today, ${first}. We hope you love it.` },
          { when: `${label(addDays(d.date, 2))}`, text: "Would you leave us a quick Google review? It really helps. [link]" },
        ]
      : [];

  return (
    <div className="ks-booktry">
      <div className="ks-booktry-page">
        <div className="ks-booktry-head">
          <span className="ks-avatar">S</span>
          <span>
            <b>Studio Thandi</b>
            <small>Hair salon · Somerset West</small>
          </span>
          <span className="ks-booktry-demo">Demo</span>
        </div>

        {!booked ? (
          <>
            <p className="ks-booktry-k">1. What would you like?</p>
            <div className="ks-booktry-services">
              {SERVICES.map((x, i) => (
                <button key={x.name} type="button" aria-pressed={service === i} onClick={() => { setService(i); setTime(null); }}>
                  <b>{x.name}</b>
                  <small>
                    R{x.price} · {x.mins < 60 ? `${x.mins} min` : `${x.mins / 60} h`.replace(".5 h", "½ h")}
                  </small>
                </button>
              ))}
            </div>

            <p className="ks-booktry-k" data-off={s === null}>2. Pick a day and time</p>
            <div className="ks-booktry-days" data-off={s === null}>
              {days.map((x, i) => (
                <button key={x.date.toISOString()} type="button" aria-pressed={day === i} disabled={s === null} onClick={() => { setDay(i); setTime(null); }}>
                  <small>{DAY[x.date.getDay()]}</small>
                  <b>{x.date.getDate()}</b>
                </button>
              ))}
            </div>
            <div className="ks-booktry-times" data-off={s === null}>
              {d.times.map((t) => (
                <button key={t} type="button" aria-pressed={time === t} disabled={s === null || d.taken.has(t)} onClick={() => setTime(t)}>
                  {d.taken.has(t) ? <s>{t}</s> : t}
                </button>
              ))}
            </div>

            <p className="ks-booktry-k" data-off={!time}>3. Your first name</p>
            <div className="ks-booktry-confirm" data-off={!time}>
              <input
                className="k-field"
                value={name}
                maxLength={30}
                placeholder="First name"
                disabled={!time}
                onChange={(e) => setName(e.target.value)}
                aria-label="Your first name"
              />
              <button type="button" className="k-btn k-btn--solid" disabled={!time} onClick={() => setBooked(true)}>
                Book {time ? `${DAY[d.date.getDay()]} ${time}` : ""}
              </button>
            </div>
          </>
        ) : (
          <div className="ks-booktry-done">
            <span className="ks-booktry-tick" aria-hidden="true" />
            <b>You&apos;re booked</b>
            <span>
              {s?.name} · {label(d.date)} at {time}
            </span>
            <button type="button" className="k-link" onClick={reset}>
              Book something else
            </button>
          </div>
        )}
      </div>

      <div className="ks-booktry-msgs">
        <p className="k-mono k-mono--ember">What the customer gets</p>
        {messages.length ? (
          <ol>
            {messages.map((m, i) => (
              <li key={m.when} style={{ animationDelay: `${i * 220}ms` }}>
                <small>{m.when}</small>
                <span>{m.text}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="k-sm">Book a time and the confirmation, the reminder, the thank-you and the review request appear here, with their real dates.</p>
        )}
        <p className="ks-chatdemo-note">Demo. Nothing is booked and nothing is sent. Every customer gets the same review request.</p>
      </div>
    </div>
  );
}
