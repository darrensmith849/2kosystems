"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/* A client page, shown under three different partners' names in turn. The
   point it makes: the page is theirs — their name, their colour, their
   contact button — and ours appears nowhere. */

const BRANDS = [
  { name: "Brightside Digital", colour: "#d9a95a" },
  { name: "Coastline Web", colour: "#4fb3a9" },
  { name: "Kasi Creative", colour: "#e0664a" },
];

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function KitPreview({ brand }: { brand?: { name: string; colour: string } }) {
  const [i, setI] = useState(0);
  const still = useSyncExternalStore(() => () => {}, reduced, () => true);

  useEffect(() => {
    if (still || brand) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % BRANDS.length), 3600);
    return () => window.clearInterval(t);
  }, [still, brand]);

  const b = brand ?? BRANDS[i];

  return (
    <div className="ks-kitp" style={{ ["--c" as string]: b.colour }} role="img" aria-label="A client page carrying the partner's name and colour, switching between three partners">
      <div className="ks-kitp-chrome">
        <i />
        <i />
        <i />
        <span className="ks-kitp-url">Link sent by {b.name}</span>
      </div>
      <div className="ks-kitp-page" key={brand ? "fixed" : b.name}>
        <div className="ks-kitp-top">
          <span className="ks-kitp-mark">{(b.name.trim() || "?").charAt(0).toUpperCase()}</span>
          <b>{b.name}</b>
        </div>
        <small className="ks-kitp-eyebrow">For your business</small>
        <p className="ks-kitp-title">Never miss a customer again.</p>
        <ul className="ks-kitp-rows">
          <li>
            <span />
            Every message answered
          </li>
          <li>
            <span />
            Bookings with reminders
          </li>
          <li>
            <span />
            Email with your name on it
          </li>
        </ul>
        <span className="ks-kitp-btn">Ask {b.name} about this</span>
      </div>
      {brand ? null : (
        <div className="ks-kitp-dots" aria-hidden="true">
          {BRANDS.map((x, n) => (
            <i key={x.name} data-on={n === i} />
          ))}
        </div>
      )}
    </div>
  );
}
