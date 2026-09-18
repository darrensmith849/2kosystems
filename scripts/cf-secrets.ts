/**
 * Push the secrets the internal dashboard needs onto the Worker.
 *
 *   npm run cf:secrets
 *
 * Reads them from .env and pipes each one to `wrangler secret put` over
 * stdin. The values never appear on screen, in your shell history, or in the
 * process list — a secret passed as an argument is visible to anyone who can
 * run `ps`.
 *
 * Idempotent: running it again just overwrites with the same values.
 */
import { spawn } from "node:child_process";
import { readEnv } from "./env-file.ts";

/**
 * Everything the Worker needs that is not already a binding.
 *
 * The INTERNAL_ACCESS pair gates /internal/*. Without them the Proxy returns
 * 404 rather than exposing the pages — which is why every internal route on
 * this site had been invisible in production since it was built.
 */
const REQUIRED = [
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_CLIENT_SECRET",
  "GOOGLE_ANALYTICS_REFRESH_TOKEN",
  "INTERNAL_ACCESS_USERNAME",
  "INTERNAL_ACCESS_PASSWORD",
  // Write-only credential for /api/enquiries. The other sites in the estate
  // hold it so they can file an enquiry; it reads nothing back.
  "ENQUIRY_INGEST_TOKEN",
  // Read-only use here: the dashboard shows the account's daily email sending
  // quota, which is the ceiling every domain in the estate shares.
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_EMAIL_TOKEN",
] as const;

function put(key: string, value: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn("npx", ["wrangler", "secret", "put", key], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let err = "";
    child.stderr.on("data", (d) => (err += d.toString()));
    child.stdout.on("data", () => {});
    child.on("close", (code) => {
      if (code === 0) {
        console.log(`  ✓ ${key.padEnd(32)} (${value.length} chars)`);
        resolve(true);
      } else {
        console.error(`  ✖ ${key}\n${err.split("\n").filter(Boolean).slice(-3).map((l) => `      ${l}`).join("\n")}`);
        resolve(false);
      }
    });
    child.stdin.write(value);
    child.stdin.end();
  });
}

const env = readEnv();
const missing = REQUIRED.filter((k) => !env.get(k));
if (missing.length) {
  console.error(`\n  ✖ Not in .env: ${missing.join(", ")}`);
  console.error(`    GOOGLE_ANALYTICS_REFRESH_TOKEN comes from: npm run ga:auth\n`);
  process.exit(1);
}

console.log("\n  Pushing to the 2kosystems Worker. Values are piped, never printed.\n");
let ok = true;
for (const key of REQUIRED) {
  if (!(await put(key, env.get(key)!))) ok = false;
}
console.log(
  ok
    ? "\n  Done. Deploy, then open /internal/dashboard.\n"
    : "\n  Some secrets failed. Check you are logged in: npx wrangler whoami\n",
);
process.exit(ok ? 0 : 1);
