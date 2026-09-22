/**
 * Google Ads API — verify the credentials in .env without re-authorising.
 *
 *   npm run ads:check
 *
 * Exchanges the stored refresh token for an access token and calls
 * listAccessibleCustomers. Use this after fixing a value rather than re-running
 * ads:auth, which would send you back through the browser for no reason.
 *
 * Prints account IDs and error causes. Never prints a credential.
 */
import { readEnv } from "./env-file.ts";

const API = "https://googleads.googleapis.com/v25";

function die(message: string): never {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

const env = readEnv();
const need = [
  "GOOGLE_ADS_DEVELOPER_TOKEN",
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_CLIENT_SECRET",
  "GOOGLE_ADS_REFRESH_TOKEN",
];
const missing = need.filter((k) => !env.get(k));
if (missing.length) die(`Missing from .env: ${missing.join(", ")}`);

// A developer token in the client-secret slot is the mistake that actually
// happened, and it costs an API round trip to diagnose. Catch it here instead.
const dev = env.get("GOOGLE_ADS_DEVELOPER_TOKEN")!;
if (dev.startsWith("GOCSPX-")) {
  die(
    "GOOGLE_ADS_DEVELOPER_TOKEN holds an OAuth client secret (it starts GOCSPX-).\n" +
      "    The developer token comes from the Ads API Center and is about 22 characters.",
  );
}

const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    client_id: env.get("GOOGLE_ADS_CLIENT_ID")!,
    client_secret: env.get("GOOGLE_ADS_CLIENT_SECRET")!,
    refresh_token: env.get("GOOGLE_ADS_REFRESH_TOKEN")!,
    grant_type: "refresh_token",
  }),
});
const tok = (await tokenRes.json()) as { access_token?: string; error_description?: string; error?: string };
if (!tok.access_token) {
  die(`Could not refresh the access token: ${tok.error_description ?? tok.error ?? "unknown"}`);
}
console.log("\n  ✓ Refresh token still valid");

const res = await fetch(`${API}/customers:listAccessibleCustomers`, {
  headers: {
    Authorization: `Bearer ${tok.access_token}`,
    "developer-token": dev,
  },
});

if (!res.ok) {
  const text = await res.text();
  let reason = text.slice(0, 300);
  try {
    const j = JSON.parse(text) as {
      error?: { message?: string; details?: { errors?: { errorCode?: Record<string, string>; message?: string }[] }[] };
    };
    const inner = j.error?.details?.flatMap((d) => d.errors ?? []) ?? [];
    if (inner.length) {
      reason = inner
        .map((e) => `${Object.values(e.errorCode ?? {})[0] ?? "?"} — ${e.message ?? ""}`)
        .join("\n    ");
    } else if (j.error?.message) reason = j.error.message;
  } catch {
    reason = `Not JSON — probably a wrong API version in this script (currently ${API}).`;
  }
  die(`API call failed (${res.status}).\n    ${reason}`);
}

const { resourceNames = [] } = (await res.json()) as { resourceNames?: string[] };
console.log(`  ✓ API reachable — ${resourceNames.length} accessible account(s):`);
for (const name of resourceNames) {
  const id = name.split("/")[1] ?? name;
  console.log(`      ${id.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3")}`);
}
console.log("");
