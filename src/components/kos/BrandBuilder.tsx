"use client";

import { useState } from "react";
import { cleanBrand, encodeBrand } from "@/lib/kos/brand-token";
import { PRODUCTS } from "@/lib/kos/catalogue";
import KitPreview from "./KitPreview";

/* "See it with your name": type your name, pick a colour, add how clients
   reach you. The client pages carry your brand at once, and the link is
   yours to send. Nothing is stored — the brand travels in the link. */

const SWATCHES = ["#d9a95a", "#e0664a", "#4fb3a9", "#5b7cfa", "#9b6cf0", "#2fa36b", "#e14d8a", "#f2f2f2"];

export default function BrandBuilder() {
  const [name, setName] = useState("");
  const [colour, setColour] = useState(SWATCHES[0]);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [copied, setCopied] = useState(false);

  const brand = cleanBrand({ n: name, c: colour, e: email, w: whatsapp });
  const path = brand ? `/kit/b/${encodeBrand(brand)}` : null;

  async function copy() {
    if (!path) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="ks-builder">
      <div className="ks-form">
        <label>
          <span>Your business name</span>
          <input
            className="k-field"
            value={name}
            maxLength={40}
            placeholder="Brightside Digital"
            onChange={(e) => setName(e.target.value)}
            autoComplete="organization"
          />
        </label>
        <fieldset>
          <span className="ks-builder-k">Your colour</span>
          <div className="ks-swatches">
            {SWATCHES.map((s) => (
              <button
                key={s}
                type="button"
                className="ks-swatch"
                style={{ background: s }}
                aria-label={`Colour ${s}`}
                aria-pressed={colour === s}
                onClick={() => setColour(s)}
              />
            ))}
            <label className="ks-swatch ks-swatch--own" aria-label="Pick your own colour">
              <input type="color" value={colour} onChange={(e) => setColour(e.target.value)} />
            </label>
          </div>
        </fieldset>
        <div className="ks-form-2">
          <label>
            <span>Email clients should use (optional)</span>
            <input className="k-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label>
            <span>WhatsApp number (optional)</span>
            <input className="k-field" type="tel" value={whatsapp} placeholder="+27…" onChange={(e) => setWhatsapp(e.target.value)} autoComplete="tel" />
          </label>
        </div>
        <p className="k-sm">With an email or WhatsApp number, the &ldquo;Ask&rdquo; button on the page reaches you.</p>

        <div className="ks-actions" style={{ marginTop: 4 }}>
          {path ? (
            <>
              <a className="k-btn k-btn--solid" href={path} target="_blank" rel="noopener">
                Open my client page
              </a>
              <button type="button" className="k-btn k-btn--ghost" onClick={copy}>
                {copied ? "Link copied" : "Copy the link"}
              </button>
            </>
          ) : (
            <span className="k-btn k-btn--ghost" aria-disabled="true">
              Type your name to start
            </span>
          )}
        </div>
        {path ? (
          <p className="k-sm ks-builder-links">
            One page per tool:{" "}
            {PRODUCTS.map((p, i) => (
              <span key={p.key}>
                {i ? " · " : ""}
                <a href={`${path}/${p.key}`} target="_blank" rel="noopener" className="k-link">
                  {p.name}
                </a>
              </span>
            ))}
          </p>
        ) : null}
      </div>

      <div className="ks-visual">
        <KitPreview brand={{ name: name.trim() || "Your business", colour }} />
      </div>
    </div>
  );
}
