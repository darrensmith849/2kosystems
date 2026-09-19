/**
 * Pixel and click-tracking URLs, and the signing that makes the click one safe
 * to expose.
 *
 * A redirect that forwards to whatever `?u=` says is an open redirect: anyone
 * can dress a phishing link in your domain's reputation. So the destination is
 * signed with HMAC-SHA256 and the redirect refuses anything that does not
 * verify. The signature covers the destination *and* the message id, so a
 * signature cannot be lifted from one message onto another.
 *
 * On honesty: an open is weak evidence. Apple Mail Privacy Protection fetches
 * every remote image in every message whether or not a human looks at it, and
 * Gmail proxies images too — so a pixel hit means "this message reached a mail
 * system", not "somebody read it". Clicks are the signal worth trusting.
 */

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const byte of b) s += String.fromCharCode(byte);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): string {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  return atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
}

async function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Truncated to 16 bytes — long enough that forging is infeasible, short enough for a URL. */
async function sign(secret: string, messageId: string, url: string): Promise<string> {
  const mac = await crypto.subtle.sign("HMAC", await key(secret), enc.encode(`${messageId}\n${url}`));
  return b64url(new Uint8Array(mac).slice(0, 16));
}

export async function verify(
  secret: string,
  messageId: string,
  url: string,
  signature: string,
): Promise<boolean> {
  const expected = await sign(secret, messageId, url);
  // Constant time: a timing oracle here would let someone grind out a valid
  // signature one character at a time.
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

export function pixelUrl(base: string, messageId: string): string {
  return `${base.replace(/\/$/, "")}/e/o/${messageId}.gif`;
}

export async function clickUrl(
  base: string,
  secret: string,
  messageId: string,
  destination: string,
): Promise<string> {
  const sig = await sign(secret, messageId, destination);
  const u = b64url(enc.encode(destination));
  return `${base.replace(/\/$/, "")}/e/c/${messageId}?u=${u}&s=${sig}`;
}

export function decodeDestination(u: string): string | null {
  try {
    const raw = fromB64url(u);
    // atob gives latin1; the destination was UTF-8 encoded before base64.
    const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
    const url = new TextDecoder().decode(bytes);
    const parsed = new URL(url);
    // Only ever redirect to the web. A signed `javascript:` or `data:` URL
    // would still be a signed attack.
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

/**
 * Rewrite every http(s) link in an HTML body through the click tracker, and
 * append the open pixel.
 *
 * Deliberately conservative. Only `href="..."` on anchors is touched — not
 * images, not CSS urls, not anything inside a `<style>` block. Unsubscribe and
 * mailto links are left alone: breaking an unsubscribe to measure it is both
 * rude and, under POPIA, the wrong side of a line.
 */
export async function instrument(
  html: string,
  opts: { base: string; secret: string; messageId: string; trackClicks?: boolean; trackOpens?: boolean },
): Promise<string> {
  let out = html;

  if (opts.trackClicks !== false) {
    const anchors = [...out.matchAll(/<a\b[^>]*?\bhref=["'](https?:\/\/[^"']+)["']/gi)];
    // Rewrite back-to-front so earlier indices stay valid.
    for (const m of anchors.reverse()) {
      const href = m[1];
      if (/unsubscribe|\/e\/c\//i.test(href)) continue;
      const tracked = await clickUrl(opts.base, opts.secret, opts.messageId, href);
      const start = m.index! + m[0].lastIndexOf(href);
      out = out.slice(0, start) + tracked + out.slice(start + href.length);
    }
  }

  if (opts.trackOpens !== false) {
    const img = `<img src="${pixelUrl(opts.base, opts.messageId)}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;border:0" />`;
    out = /<\/body>/i.test(out) ? out.replace(/<\/body>/i, `${img}</body>`) : out + img;
  }

  return out;
}
