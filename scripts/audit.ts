/**
 * Google Ads audit — CLI.
 *
 *   node scripts/audit.ts <export.csv> [more.csv ...] [--brand "term,term"] [--on bucket] [--off bucket]
 *
 * Report kinds are detected from the CSV headers, so filenames do not matter.
 * Requires Node 22+ for native TypeScript.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { loadReports, renderReport, runAudit } from "../src/lib/audit/index.ts";

const argv = process.argv.slice(2);
const files: string[] = [];
const opts: Record<string, string> = {};

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith("--")) opts[a.slice(2)] = argv[++i] ?? "";
  else files.push(a);
}

if (!files.length) {
  console.error("usage: node scripts/audit.ts <export.csv> [...] [--brand terms] [--on bucket] [--off bucket] [--json out.json] [--out report.md]");
  process.exit(1);
}

const { reports, unrecognised } = loadReports(
  files.map((f) => ({ name: basename(f), text: readFileSync(f, "utf8") })),
);

for (const name of unrecognised) console.error(`  skipped (unrecognised format): ${name}`);
const kinds = Object.keys(reports);
if (!kinds.length) {
  console.error("No recognisable Google Ads exports found.");
  process.exit(1);
}
console.error(`  loaded: ${kinds.join(", ")}`);

const result = runAudit(reports, {
  brandTerms: (opts.brand ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  bucketsOn: (opts.on ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  bucketsOff: (opts.off ?? "").split(",").map((s) => s.trim()).filter(Boolean),
});

const markdown = renderReport(result);
if (opts.out) writeFileSync(opts.out, markdown);
else console.log(markdown);
if (opts.json) writeFileSync(opts.json, JSON.stringify(result, null, 2));
