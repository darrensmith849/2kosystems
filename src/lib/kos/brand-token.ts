/**
 * A partner's brand, carried in the link itself.
 *
 * "See it with your name": a partner types their name, picks a colour and adds a contact, and gets a
 * client page carrying their brand straight away — no account, nothing stored. The brand travels in
 * the URL as base64url JSON (/kit/b/<token>), so the link they send a client keeps working.
 *
 * Everything decoded is validated as if it were typed into a form, because it was. React escapes it
 * on the way out; the checks here keep it short, a real colour, and a real contact.
 */

import type { Partner } from "./partners";

export type BrandInput = { n: string; c: string; e?: string; w?: string };

const COLOUR = /^#[0-9a-f]{6}$/i;
const EMAIL = /^[^\s@<>]{1,64}@[^\s@<>]{1,190}\.[a-z]{2,}$/i;

export function cleanBrand(input: Partial<BrandInput>): BrandInput | null {
  const n = String(input.n ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
  const c = String(input.c ?? "").trim();
  if (n.length < 2 || !COLOUR.test(c)) return null;
  const e = String(input.e ?? "").trim().slice(0, 254);
  const w = String(input.w ?? "").replace(/[^\d]/g, "").slice(0, 15);
  return {
    n,
    c: c.toLowerCase(),
    ...(EMAIL.test(e) ? { e } : {}),
    ...(w.length >= 9 ? { w } : {}),
  };
}

function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(token: string) {
  const padded = token.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((token.length + 3) % 4);
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (ch) => ch.charCodeAt(0)));
}

export function encodeBrand(brand: BrandInput): string {
  return toBase64Url(JSON.stringify(brand));
}

export function decodeBrand(token: string): BrandInput | null {
  if (!/^[A-Za-z0-9_-]{8,600}$/.test(token)) return null;
  try {
    return cleanBrand(JSON.parse(fromBase64Url(token)) as Partial<BrandInput>);
  } catch {
    return null;
  }
}

/** A brand from a link, as a partner the client pages can render. */
export function partnerFromToken(token: string): Partner | null {
  const b = decodeBrand(token);
  if (!b) return null;
  return {
    slug: token,
    base: `/kit/b/${token}`,
    name: b.n,
    colour: b.c,
    email: b.e,
    whatsapp: b.w,
    preview: true,
  };
}
