/**
 * Google Ads API — mint a refresh token.
 *
 *   npm run ads:auth
 *
 * Runs the OAuth 2.0 loopback flow once. Google hands back a refresh token,
 * which this writes into .env; from then on the three credentials authenticate
 * every API call with no further sign-in.
 *
 * Nothing secret is ever printed. The token goes to disk and the terminal only
 * says whether it worked, because a refresh token in scrollback is a refresh
 * token in your shell history.
 *
 * Requires Node 22+ for native TypeScript, same as scripts/audit.ts.
 *
 * Prerequisites, both from the Cloud project ko-ads-api (41808878114):
 *   GOOGLE_ADS_CLIENT_ID      OAuth 2.0 Client ID, type "Desktop app"
 *   GOOGLE_ADS_CLIENT_SECRET  its secret
 * plus GOOGLE_ADS_DEVELOPER_TOKEN from the Ads API Center, which lets the
 * verification step at the end actually call the API.
 */
import { createServer, type Server } from "node:http";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { readEnv, writeEnvKey } from "./env-file.ts";

const SCOPE = "https://www.googleapis.com/auth/adwords";
const AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN = "https://oauth2.googleapis.com/token";
const API = "https://googleads.googleapis.com/v21";

/** The 2KO Group manager account — login-customer-id on every call. */
const LOGIN_CUSTOMER_ID = "4343634049";

/**
 * Prompts only when there is a terminal to prompt at. Piped into, readline
 * resolves nothing and the process used to fall off the end of the event loop
 * and exit 0 with no message at all — which looks exactly like success.
 */
async function ask(question: string, key: string) {
  if (!process.stdin.isTTY) {
    die(
      `${key} is not set and there is no terminal to ask at.\n` +
        `    Put it in .env (which is gitignored) and run this again.`,
    );
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(question)).trim();
  rl.close();
  return answer;
}

function die(message: string): never {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

/* -------------------------------------------------------------- the server */

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

/**
 * Binds a loopback listener and returns its port immediately, plus a promise
 * that settles when Google redirects back to it.
 *
 * The port has to be known before the auth URL is built, because it is part of
 * the redirect_uri — so binding comes first and the wait comes after.
 */
function listenForCode(state: string): Promise<{
  port: number;
  code: Promise<string>;
  close: () => void;
}> {
  return new Promise((ready, failed) => {
    let settle: (code: string) => void;
    let reject: (e: Error) => void;
    const code = new Promise<string>((res, rej) => {
      settle = res;
      reject = rej;
    });

    const server: Server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      const err = url.searchParams.get("error");
      const got = url.searchParams.get("state");
      const authCode = url.searchParams.get("code");

      const respond = (title: string, body: string) => {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(page(title, body));
      };

      if (err) {
        respond("Authorisation declined", `Google said: ${err}`);
        reject(new Error(`Google returned error=${err}`));
        return;
      }
      // Stops a stray request to this port being taken for our callback.
      if (got !== state) {
        respond("Ignored", "That request did not come from this sign-in.");
        return;
      }
      if (!authCode) {
        respond("No code", "Google redirected without an authorisation code.");
        reject(new Error("redirect carried no authorisation code"));
        return;
      }
      respond("Done — you can close this tab", "The refresh token has been written to .env");
      settle(authCode);
    });

    server.on("error", failed);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as { port: number };
      ready({ port, code, close: () => server.close() });
    });
  });
}

function openBrowser(url: string) {
  const cmd =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  try {
    spawn(cmd, [url], { detached: true, stdio: "ignore" }).unref();
    return true;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------- main */

async function main() {
  const env = readEnv();

  const clientId =
    env.get("GOOGLE_ADS_CLIENT_ID") || (await ask("  OAuth client ID: ", "GOOGLE_ADS_CLIENT_ID"));
  const clientSecret =
    env.get("GOOGLE_ADS_CLIENT_SECRET") ||
    (await ask("  OAuth client secret: ", "GOOGLE_ADS_CLIENT_SECRET"));

  if (!clientId || !clientSecret) die("Need both a client ID and a client secret.");
  if (!clientId.endsWith(".apps.googleusercontent.com")) {
    die(
      "That does not look like a Google OAuth client ID — it should end " +
        ".apps.googleusercontent.com",
    );
  }

  // Persist them so this only has to be typed once.
  writeEnvKey("GOOGLE_ADS_CLIENT_ID", clientId);
  writeEnvKey("GOOGLE_ADS_CLIENT_SECRET", clientSecret);

  const state = randomBytes(16).toString("hex");
  const { port, code, close } = await listenForCode(state);
  const redirectUri = `http://127.0.0.1:${port}`;

  const authUrl =
    `${AUTH}?` +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: SCOPE,
      // Without offline + consent Google returns an access token only, and
      // silently omits the refresh token on any re-authorisation.
      access_type: "offline",
      prompt: "consent",
      state,
    }).toString();

  console.log("\n  Opening Google for authorisation…");
  console.log(`  Sign in as the account that owns the Ads manager, not a personal one.`);
  if (!openBrowser(authUrl)) {
    console.log(`\n  Could not open a browser. Paste this in:\n\n  ${authUrl}\n`);
  }

  let authCode: string;
  try {
    authCode = await Promise.race([
      code,
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error("timed out after 5 minutes")), 300_000),
      ),
    ]);
  } catch (e) {
    close();
    die(`Authorisation failed: ${(e as Error).message}`);
  }
  // Let the browser render the success page before the socket goes away.
  setTimeout(close, 1500);

  const res = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: authCode,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const body = (await res.json()) as {
    refresh_token?: string;
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!res.ok) {
    die(
      `Token exchange failed (${res.status}): ${body.error ?? "unknown"}` +
        `${body.error_description ? ` — ${body.error_description}` : ""}`,
    );
  }
  if (!body.refresh_token) {
    die(
      "Google returned an access token but no refresh token. That happens when " +
        "this client has been authorised before — revoke it at " +
        "https://myaccount.google.com/permissions and run this again.",
    );
  }

  writeEnvKey("GOOGLE_ADS_REFRESH_TOKEN", body.refresh_token);
  writeEnvKey("GOOGLE_ADS_LOGIN_CUSTOMER_ID", LOGIN_CUSTOMER_ID);
  console.log("\n  ✓ Refresh token written to .env (not printed, by design)");

  /* --------------------------------------------------------- verification */

  const devToken = readEnv().get("GOOGLE_ADS_DEVELOPER_TOKEN");
  if (!devToken) {
    console.log(
      "\n  GOOGLE_ADS_DEVELOPER_TOKEN is not in .env yet, so the API call was\n" +
        "  skipped. Add it from the Ads API Center and run this again to verify.\n",
    );
    return;
  }

  const check = await fetch(`${API}/customers:listAccessibleCustomers`, {
    headers: {
      Authorization: `Bearer ${body.access_token}`,
      "developer-token": devToken,
    },
  });

  if (!check.ok) {
    const text = await check.text();
    die(
      `Credentials saved, but the test call failed (${check.status}).\n` +
        `    ${text.slice(0, 400)}`,
    );
  }

  const { resourceNames = [] } = (await check.json()) as { resourceNames?: string[] };
  console.log(`  ✓ API reachable — ${resourceNames.length} accessible account(s):`);
  for (const name of resourceNames) {
    const id = name.split("/")[1] ?? name;
    const pretty = id.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");
    console.log(`      ${pretty}`);
  }
  console.log("");
}

main().catch((e: unknown) => {
  die(e instanceof Error ? e.message : String(e));
});
