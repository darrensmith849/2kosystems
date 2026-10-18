import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, readProtectedJson } from "@/lib/api-protection";
import { candidates } from "@/lib/kos/domains";

/**
 * "What would your business email look like?" on 2kosystems.com.
 *
 * Turns a business name (or a domain someone already has) into a few domains and asks public DNS,
 * through Cloudflare's DNS-over-HTTPS, whether each one is in use — and, if it is, who handles its
 * email. Public DNS cannot prove a domain is free to buy (it can be registered and unused, or held by
 * the registry), so the page says "looks free" and we confirm before buying anything.
 */

type Result = {
  domain: string;
  status: "free" | "taken" | "unknown";
  mail: string | null;
};

const MAIL_HOSTS: [RegExp, string][] = [
  [/google\.com\.?$|googlemail\.com\.?$/i, "Google"],
  [/outlook\.com\.?$|microsoft\.com\.?$/i, "Microsoft 365"],
  [/zoho\.(com|eu)\.?$/i, "Zoho"],
  [/mx\.cloudflare\.net\.?$/i, "Cloudflare forwarding"],
  [/mailgun|sendgrid|mimecast/i, "a business mail service"],
];

async function dns(name: string, type: "NS" | "MX") {
  const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, {
    headers: { accept: "application/dns-json" },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`dns ${res.status}`);
  return (await res.json()) as { Status: number; Answer?: { data: string }[] };
}

async function check(domain: string): Promise<Result> {
  try {
    const ns = await dns(domain, "NS");
    if (ns.Status === 3) return { domain, status: "free", mail: null };
    if (ns.Status !== 0) return { domain, status: "unknown", mail: null };
    const mx = await dns(domain, "MX").catch(() => null);
    const hosts = (mx?.Answer ?? []).map((a) => a.data.split(" ").pop() ?? "");
    const mail = hosts.length ? (MAIL_HOSTS.find(([re]) => hosts.some((h) => re.test(h)))?.[1] ?? "their own mail server") : null;
    return { domain, status: "taken", mail };
  } catch {
    return { domain, status: "unknown", mail: null };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await readProtectedJson<{ name?: string }>(req, { endpoint: "kos-domain-check", limit: 20, windowMs: 10 * 60 * 1000 });
    const list = candidates(String(body.name ?? "").slice(0, 80));
    if (!list.length) return NextResponse.json({ ok: false, error: "Type your business name, or the website you already have." }, { status: 400 });
    const results = await Promise.all(list.map(check));
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    const guarded = apiErrorResponse(error);
    if (guarded) return guarded;
    console.error("/api/kos/domain-check failed", error);
    return NextResponse.json({ ok: false, error: "Couldn't check just now. Try again in a moment." }, { status: 500 });
  }
}
