import { NextRequest, NextResponse } from "next/server";
import { LEGACY_SITE_HOSTS, SITE_HOST } from "@/lib/site";
import { legacyDestination } from "@/lib/legacy-redirects";
import { isTrackingHost } from "@/lib/tracking/domains";
import { REQUESTED_PATH } from "@/lib/site";

function constantTimeEqual(left: string, right: string) {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  let mismatch = a.length ^ b.length;
  const length = Math.max(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    mismatch |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }

  return mismatch === 0;
}

/**
 * Cloudflare Access verification.
 *
 * Access gates 2ko.co.za/internal and www.2ko.co.za/internal at the edge, so
 * in the ordinary case a request only reaches this Worker after someone has
 * signed in with a one-time PIN. That is not enough on its own: this Worker
 * also answers on hostnames the Access application does not cover, and an
 * Access app can be edited or deleted without anyone touching this code. So
 * the token is verified here too, and a request without a valid one is not
 * treated as authenticated no matter which header it carries.
 *
 * `Cf-Access-Authenticated-User-Email` is deliberately NOT trusted. It is an
 * ordinary request header — authoritative only because Access strips and
 * rewrites it, which is a guarantee that exists at the edge and nowhere else.
 * The signature on the assertion is the thing that cannot be forged.
 */

type AccessJwk = { kid: string; kty: string; n: string; e: string; alg?: string };

/**
 * Cached per isolate. These are public signing keys, so caching them is safe in
 * a way that caching a binding would not be — there is nothing request-scoped
 * here. Cloudflare rotates them roughly every six weeks and publishes the new
 * key before it signs with it, so an hour of staleness never rejects a good
 * token; an unknown `kid` refetches immediately in any case.
 */
let accessKeyCache: { keys: AccessJwk[]; at: number } | null = null;
const ACCESS_KEY_TTL_MS = 60 * 60 * 1000;

async function accessKeys(teamDomain: string, force = false): Promise<AccessJwk[]> {
  if (!force && accessKeyCache && Date.now() - accessKeyCache.at < ACCESS_KEY_TTL_MS) {
    return accessKeyCache.keys;
  }

  const response = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!response.ok) throw new Error(`Access certs: HTTP ${response.status}`);

  const body = (await response.json()) as { keys?: AccessJwk[] };
  accessKeyCache = { keys: body.keys ?? [], at: Date.now() };
  return accessKeyCache.keys;
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padding = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/") + padding);
  // Backed by a concrete ArrayBuffer rather than ArrayBufferLike, which is what
  // crypto.subtle accepts as a BufferSource.
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

/** The verified email, or null. Never throws — a failure here is a refusal. */
async function accessEmail(request: NextRequest): Promise<string | null> {
  const teamDomain = process.env.ACCESS_TEAM_DOMAIN;
  const audience = process.env.ACCESS_AUD;
  if (!teamDomain || !audience) return null;

  const token =
    request.headers.get("cf-access-jwt-assertion") ??
    request.cookies.get("CF_Authorization")?.value;
  if (!token) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) return null;

  try {
    const decoder = new TextDecoder();
    const header = JSON.parse(decoder.decode(base64UrlToBytes(encodedHeader))) as {
      alg?: string;
      kid?: string;
    };
    const payload = JSON.parse(decoder.decode(base64UrlToBytes(encodedPayload))) as {
      aud?: string | string[];
      iss?: string;
      exp?: number;
      nbf?: number;
      email?: string;
    };

    // Pinned, so a token presented as `alg: none` — or signed with a symmetric
    // algorithm using the public key as the secret — cannot verify.
    if (header.alg !== "RS256" || !header.kid) return null;

    let keys = await accessKeys(teamDomain);
    let jwk = keys.find((key) => key.kid === header.kid);
    if (!jwk) {
      // Unknown key id most likely means rotation since the last fetch.
      keys = await accessKeys(teamDomain, true);
      jwk = keys.find((key) => key.kid === header.kid);
    }
    if (!jwk) return null;

    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const signed = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      base64UrlToBytes(encodedSignature),
      signed,
    );
    if (!valid) return null;

    // A signature alone only proves Access issued this. The audience check is
    // what ties it to *this* application: a valid token for any other app in
    // the same Access organisation would otherwise open the dashboard.
    const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!audiences.includes(audience)) return null;
    if (payload.iss !== `https://${teamDomain}`) return null;

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || payload.exp <= now) return null;
    if (typeof payload.nbf === "number" && payload.nbf > now + 60) return null;

    return payload.email ?? "";
  } catch {
    return null;
  }
}

function internalAuthorised(request: NextRequest) {
  const expectedUser = process.env.INTERNAL_ACCESS_USERNAME;
  const expectedPassword = process.env.INTERNAL_ACCESS_PASSWORD;
  if (!expectedUser || !expectedPassword) return false;

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return false;

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    if (separator < 0) return false;
    const user = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    return constantTimeEqual(user, expectedUser) && constantTimeEqual(password, expectedPassword);
  } catch {
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  const hostname = (request.headers.get("host") || request.nextUrl.hostname)
    .split(":")[0]
    .toLowerCase();

  // Addresses from the WordPress site this one replaced. Checked before the
  // host canonicalisation so that an apex legacy URL resolves in one hop rather
  // than 308-ing to www and only then finding its destination. Query strings
  // are dropped: on the old site they were WooCommerce and tracking noise, and
  // none of them mean anything to the pages being redirected to.
  //
  // WordPress wrote trailing slashes, and Next removes them before Proxy runs,
  // so most legacy URLs arrive here already stripped and answer as 308 then
  // 301. That chain is deliberate. `skipTrailingSlashRedirect` would collapse
  // it to one hop, at the price of serving every page on the site at both
  // `/page` and `/page/` with a 200 — duplicate URLs across the whole site to
  // save a hop on retired ones. Both redirects are permanent and search engines
  // follow them, so the chain costs a round trip and nothing else.
  // The go.* hostnames exist only to serve open pixels and click redirects.
  // They resolve to this Worker, which would otherwise happily serve the whole
  // 2KO marketing site on four extra domains — duplicate content, and a
  // confusing thing to find if you ever paste a tracking URL into a browser.
  // Everything outside /e/ is refused before any other rule runs, including
  // the host canonicalisation below, which would otherwise bounce these to
  // www.2ko.co.za and break every link in every email.
  if (isTrackingHost(hostname)) {
    if (request.nextUrl.pathname.startsWith("/e/")) {
      return NextResponse.next();
    }
    return new NextResponse("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const destination = legacyDestination(request.nextUrl.pathname);
  if (destination) {
    const target = destination.startsWith("http")
      ? new URL(destination)
      : new URL(destination, `https://${SITE_HOST}`);
    return NextResponse.redirect(target, 301);
  }

  if (LEGACY_SITE_HOSTS.has(hostname) || hostname === "2ko.co.za") {
    const canonical = request.nextUrl.clone();
    canonical.protocol = "https:";
    canonical.hostname = SITE_HOST;
    canonical.port = "";
    return NextResponse.redirect(canonical, 308);
  }

  if (request.nextUrl.pathname.startsWith("/internal")) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.next();
    }

    const accessConfigured = Boolean(process.env.ACCESS_TEAM_DOMAIN && process.env.ACCESS_AUD);
    const basicConfigured = Boolean(
      process.env.INTERNAL_ACCESS_USERNAME && process.env.INTERNAL_ACCESS_PASSWORD,
    );

    // Secure by default: with no way to authenticate configured at all, the
    // dashboard is absent rather than accidentally public.
    if (!accessConfigured && !basicConfigured) {
      return new NextResponse("Not found", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    // Cloudflare Access — one-time PIN — is the way in, and its assertion is
    // verified rather than taken on trust. Basic auth stays as an alternative
    // only while the PIN flow is confirmed end to end; once it is, dropping
    // INTERNAL_ACCESS_USERNAME/PASSWORD collapses this to "a verified Access
    // token, or nothing", with no shared password left in the estate.
    const authenticated =
      (accessConfigured && (await accessEmail(request)) !== null) ||
      (basicConfigured && internalAuthorised(request));

    if (!authenticated) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
          "WWW-Authenticate": 'Basic realm="2KO internal process library", charset="UTF-8"',
        },
      });
    }
  }

  // The 404 page needs the address that missed, so it can answer the specific
  // thing the visitor was looking for. Next does not pass the path to
  // `not-found`, and there is no public header carrying it, so it goes on here.
  const forwarded = new Headers(request.headers);
  forwarded.set(REQUESTED_PATH, request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: forwarded } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
