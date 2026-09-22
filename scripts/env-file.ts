/**
 * Reading and writing keys in .env, shared by the scripts that need it.
 *
 * Lives here rather than in src/lib because it is build-time tooling, not
 * application code — nothing in the site bundle should be able to read .env
 * off the filesystem.
 */
import { readFileSync, writeFileSync, existsSync, chmodSync } from "node:fs";

export const ENV_PATH = new URL("../.env", import.meta.url).pathname;

export function readEnv(): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(ENV_PATH)) return map;
  for (const line of readFileSync(ENV_PATH, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) map.set(m[1], m[2].replace(/^["']|["']$/g, "").trim());
  }
  return map;
}

/**
 * Rewrites a key in place if present, appends it if not. Never reorders, so
 * the comments in .env.example survive a copy and stay next to their keys.
 *
 * Mode 0600 because this file holds a developer token and a refresh token.
 */
export function writeEnvKey(key: string, value: string) {
  const line = `${key}=${value}`;

  if (!existsSync(ENV_PATH)) {
    writeFileSync(ENV_PATH, `${line}\n`);
  } else {
    const lines = readFileSync(ENV_PATH, "utf8").split("\n");
    const i = lines.findIndex((l) => new RegExp(`^\\s*${key}\\s*=`).test(l));
    if (i >= 0) lines[i] = line;
    else {
      if (lines.at(-1)?.trim() !== "") lines.push("");
      lines.push(line);
    }
    writeFileSync(ENV_PATH, `${lines.join("\n").replace(/\n+$/, "")}\n`);
  }

  // Explicitly, every time. writeFileSync's `mode` is honoured only when it
  // creates the file, so a .env that already existed — copied from
  // .env.example, say — keeps whatever permissions it had. That was 644 here,
  // which is world-readable, on a file about to hold a developer token.
  chmodSync(ENV_PATH, 0o600);
}
