/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Read the Cloudflare DNS records the proxy hides.
 *
 *   npm run cf:dns                 every zone, summarised
 *   npm run cf:dns -- sigmafy.co   one zone, every record
 *
 * Four hostnames in the estate are Cloudflare-proxied with no Pages project
 * and no Worker behind them — sixsigmauk.com, sixsigmakenya.com, sigmafy.co
 * and its subdomains. From outside, the orange cloud is all you can see:
 * certificate transparency, subdomain probing and the mail boxes all came up
 * empty, and the Xneelo mail IPs return 421 for the web hostnames. The origin
 * is in the zone's own records, and this reads them.
 *
 * Needs CLOUDFLARE_API_TOKEN in .env with Zone:Read + DNS:Read on all zones.
 * Wrangler's OAuth session cannot be reused for this; it has no DNS command.
 */
import { readEnv } from "./env-file.ts";

const API = "https://api.cloudflare.com/client/v4";
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith("-"));

const env = readEnv();
const TOKEN = env.get("CLOUDFLARE_API_TOKEN");

async function api(path: string) {
  const r = await fetch(`${API}/${path}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const j: any = await r.json().catch(() => ({}));
  if (!j.success) {
    const m = j.errors?.map((e: any) => `${e.code} ${e.message}`).join("; ") ?? r.statusText;
    if (/9109|authentication|Invalid request headers/i.test(m)) {
      throw new Error(`Cloudflare rejected the token (${m}).\n    It needs Zone:Read and DNS:Read on all zones.`);
    }
    throw new Error(m);
  }
  return j.result;
}

/** A record pointing at something that is not Cloudflare is the origin. */
const CF_IP = /^(104\.1[6-9]\.|104\.2[0-7]\.|172\.6[4-9]\.|172\.7[01]\.|188\.114\.|162\.159\.|198\.41\.)/;

async function main() {
  if (!TOKEN) {
    console.error(`
  ✖ No CLOUDFLARE_API_TOKEN in .env

    Create one at https://dash.cloudflare.com/profile/api-tokens
      · Create Token → Custom token
      · Permissions:  Zone → Zone → Read
                      Zone → DNS  → Read
      · Zone Resources: Include → All zones
    Then:  npm run env:set CLOUDFLARE_API_TOKEN
`);
    process.exit(1);
  }

  const zones: any[] = await api("zones?per_page=200");
  const wanted = ONLY.length ? zones.filter((z) => ONLY.includes(z.name)) : zones;
  if (ONLY.length && !wanted.length) {
    console.error(`\n  ✖ No such zone on this account. Have: ${zones.map((z) => z.name).join(", ")}\n`);
    process.exit(1);
  }

  console.log(`\n  ${zones.length} zones on the account${ONLY.length ? `, showing ${wanted.length}` : ""}\n`);

  for (const z of wanted) {
    const records: any[] = await api(`zones/${z.id}/dns_records?per_page=500`);
    const web = records.filter((r) => ["A", "AAAA", "CNAME"].includes(r.type));
    // An origin only hides behind a proxied record; unproxied ones are already visible.
    const origins = web.filter((r) => r.proxied && r.type !== "CNAME" && !CF_IP.test(r.content));
    const viaCname = web.filter((r) => r.proxied && r.type === "CNAME");

    console.log(`── ${z.name}  (${z.status})`);
    if (ONLY.length) {
      for (const r of web)
        console.log(`   ${r.proxied ? "☁" : " "} ${r.type.padEnd(5)} ${r.name.padEnd(34)} ${r.content}`);
    } else {
      if (origins.length) for (const r of origins) console.log(`   ► origin ${r.name.padEnd(30)} ${r.content}`);
      if (viaCname.length) for (const r of viaCname) console.log(`   ► cname  ${r.name.padEnd(30)} ${r.content}`);
      if (!origins.length && !viaCname.length) console.log(`     (no proxied origin records)`);
    }
    console.log();
  }
}

main().catch((e) => { console.error(`\n  ✖ ${e.message}\n`); process.exit(1); });
