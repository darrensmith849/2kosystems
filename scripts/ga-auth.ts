/**
 * Google Analytics Admin API — mint a refresh token.
 *
 *   npm run ga:auth
 *
 * Same OAuth client as the Ads scripts (same Cloud project), different scope.
 * The Ads token carries `adwords` only and cannot read or create GA4
 * properties, so this stores a separate refresh token alongside it.
 *
 * Nothing secret is printed. The token goes to .env and the terminal only says
 * whether it worked — a refresh token in scrollback is a refresh token in your
 * shell history.
 *
 * Prerequisite, one console step: enable "Google Analytics Admin API" on the
 * Cloud project 2ko-ads-api (41808878114). Without it the token mints fine and
 * every call afterwards returns 403 SERVICE_DISABLED.
 */
import { createServer, type Server } from "node:http";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { readEnv, writeEnvKey } from "./env-file.ts";

const SCOPE = "https://www.googleapis.com/auth/analytics.edit";
const AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN = "https://oauth2.googleapis.com/token";

function die(message: string): never {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

function page(title: string, body: string) {
  return (
    `<!doctype html><meta charset="utf-8"><title>${title}</title>` +
    `<body style="margin:0;display:grid;place-items:center;height:100vh;` +
    `font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;` +
    `background:#0d0e10;color:#f7f8f8"><div style="text-align:center">` +
    `<p style="font-size:19px;margin:0 0 6px">${title}</p>` +
    `<p style="color:#8a8f98;margin:0">${body}</p></div>`
  );
}

function listenForCode(state: string): Promise<{ port: number; code: Promise<string>; close: () => void }> {
  return new Promise((ready, failed) => {
    let settle: (c: string) => void, reject: (e: Error) => void;
    const code = new Promise<string>((res, rej) => { settle = res; reject = rej; });
    const server: Server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      const respond = (t: string, b: string) => { res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }); res.end(page(t, b)); };
      const err = url.searchParams.get("error");
      if (err) { respond("Authorisation declined", `Google said: ${err}`); reject(new Error(`error=${err}`)); return; }
      if (url.searchParams.get("state") !== state) { respond("Ignored", "That request did not come from this sign-in."); return; }
      const c = url.searchParams.get("code");
      if (!c) { respond("No code", "Google redirected without an authorisation code."); reject(new Error("no code")); return; }
      respond("Done — you can close this tab", "The refresh token has been written to .env");
      settle(c);
    });
    server.on("error", failed);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as { port: number };
      ready({ port, code, close: () => server.close() });
    });
  });
}

const env = readEnv();
const clientId = env.get("GOOGLE_ADS_CLIENT_ID");
const clientSecret = env.get("GOOGLE_ADS_CLIENT_SECRET");
if (!clientId || !clientSecret) die("GOOGLE_ADS_CLIENT_ID / _SECRET must already be in .env — run npm run ads:auth first.");

const state = randomBytes(16).toString("hex");
const { port, code, close } = await listenForCode(state);
const redirectUri = `http://127.0.0.1:${port}`;
const authUrl = `${AUTH}?` + new URLSearchParams({
  client_id: clientId, redirect_uri: redirectUri, response_type: "code", scope: SCOPE,
  access_type: "offline", prompt: "consent", state,
}).toString();

console.log("\n  Opening Google for authorisation…");
console.log("  Sign in as the account that owns the Analytics properties.");
const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
try { spawn(opener, [authUrl], { detached: true, stdio: "ignore" }).unref(); }
catch { console.log(`\n  Could not open a browser. Paste this in:\n\n  ${authUrl}\n`); }

let authCode: string;
try {
  authCode = await Promise.race([
    code,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timed out after 5 minutes")), 300_000)),
  ]);
} catch (e) { close(); die(`Authorisation failed: ${(e as Error).message}`); }
setTimeout(close, 1500);

const res = await fetch(TOKEN, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    code: authCode, client_id: clientId, client_secret: clientSecret,
    redirect_uri: redirectUri, grant_type: "authorization_code",
  }).toString(),
});
const json = (await res.json()) as { refresh_token?: string; error_description?: string; error?: string };
if (!res.ok || !json.refresh_token) {
  die(`Google did not return a refresh token: ${json.error_description ?? json.error ?? res.status}`);
}
writeEnvKey("GOOGLE_ANALYTICS_REFRESH_TOKEN", json.refresh_token);
console.log("\n  ✓ Refresh token written to .env (GOOGLE_ANALYTICS_REFRESH_TOKEN).");
console.log("    Next: npm run ga:audit\n");
