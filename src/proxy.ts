import { NextRequest, NextResponse } from "next/server";
import { LEGACY_SITE_HOSTS, SITE_HOST } from "@/lib/site";
import { legacyDestination } from "@/lib/legacy-redirects";
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

export default function proxy(request: NextRequest) {
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

    // Secure by default: if production credentials have not been configured,
    // the library is absent rather than accidentally public.
    if (!process.env.INTERNAL_ACCESS_USERNAME || !process.env.INTERNAL_ACCESS_PASSWORD) {
      return new NextResponse("Not found", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    if (!internalAuthorised(request)) {
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
