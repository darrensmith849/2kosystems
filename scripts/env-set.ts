/**
 * Put a secret into .env without it ever appearing on screen.
 *
 *   pbpaste | node scripts/env-set.ts GOOGLE_ADS_DEVELOPER_TOKEN
 *
 * Reads the value from stdin, so the secret goes clipboard → file and never
 * touches the terminal, your shell history, or a chat window. Prints only the
 * key name and the character count, which is enough to tell a paste that
 * worked from one that grabbed the wrong thing.
 */
import { writeEnvKey, ENV_PATH, readEnv } from "./env-file.ts";

const key = process.argv[2];

if (!key || !/^[A-Z][A-Z0-9_]*$/.test(key)) {
  console.error(
    "\n  Usage: pbpaste | node scripts/env-set.ts KEY_NAME\n" +
      "  KEY_NAME must be upper snake case, e.g. GOOGLE_ADS_CLIENT_ID\n",
  );
  process.exit(1);
}

let value = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) value += chunk;
value = value.trim();

if (!value) {
  console.error(`\n  ✖ Nothing on stdin — the clipboard looks empty.\n`);
  process.exit(1);
}
if (/\s/.test(value)) {
  console.error(
    `\n  ✖ That value contains whitespace, so it is probably not just the secret.\n` +
      `    Re-copy it and try again.\n`,
  );
  process.exit(1);
}

const existed = readEnv().has(key);
writeEnvKey(key, value);
console.log(`\n  ✓ ${existed ? "Replaced" : "Set"} ${key} (${value.length} chars) in ${ENV_PATH}\n`);
