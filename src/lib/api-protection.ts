import "server-only";

import type { NextRequest } from "next/server";
import { LEGACY_SITE_HOSTS, SITE_HOST } from "@/lib/site";

type GuardOptions = {
  endpoint: string;
  limit: number;
  windowMs: number;
  maxBodyBytes?: number;
};

type Bucket = { count: number; resetsAt: number };

const buckets = new Map<string, Bucket>();
const DEFAULT_MAX_BODY_BYTES = 96 * 1024;

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

function requestIp(req: NextRequest) {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    ""
  );
}

function allowedOrigin(origin: string) {
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    return false;
  }

  return (
    url.hostname === SITE_HOST ||
    url.hostname === "2ko.co.za" ||
    LEGACY_SITE_HOSTS.has(url.hostname) ||
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1"
  );
}

function enforceOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && !allowedOrigin(origin)) {
    throw new ApiRequestError("That request origin is not allowed.", 403);
  }
}

function enforceRateLimit(req: NextRequest, options: GuardOptions) {
  const ip = requestIp(req);
  // Cloudflare provides cf-connecting-ip in production. Do not group all local
  // or direct server-to-server calls into one shared anonymous bucket.
  if (!ip) return;

  const now = Date.now();
  const key = `${options.endpoint}:${ip}`;
  const current = buckets.get(key);
  const bucket = !current || current.resetsAt <= now
    ? { count: 0, resetsAt: now + options.windowMs }
    : current;

  bucket.count += 1;
  buckets.set(key, bucket);

  if (buckets.size > 10_000) {
    for (const [entryKey, entry] of buckets) {
      if (entry.resetsAt <= now) buckets.delete(entryKey);
    }
  }

  if (bucket.count > options.limit) {
    throw new ApiRequestError(
      "Too many attempts. Please wait a few minutes and try again.",
      429,
      Math.max(1, Math.ceil((bucket.resetsAt - now) / 1000)),
    );
  }
}

export async function readProtectedJson<T>(req: NextRequest, options: GuardOptions): Promise<T> {
  enforceOrigin(req);
  enforceRateLimit(req, options);

  if (!req.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw new ApiRequestError("This endpoint accepts JSON only.", 415);
  }

  const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
  const declaredLength = Number(req.headers.get("content-length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
    throw new ApiRequestError("That request is too large.", 413);
  }

  const raw = await req.text();
  if (new TextEncoder().encode(raw).byteLength > maxBodyBytes) {
    throw new ApiRequestError("That request is too large.", 413);
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ApiRequestError("The request body is not valid JSON.", 400);
  }
}

export function apiErrorResponse(error: unknown) {
  if (!(error instanceof ApiRequestError)) return null;

  const headers = error.retryAfter
    ? { "Retry-After": String(error.retryAfter) }
    : undefined;

  return Response.json(
    { ok: false, error: error.message },
    { status: error.status, headers },
  );
}
