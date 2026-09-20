/**
 * Regression cases for the open/click proxy detector.
 *
 * The first case is a real event captured from this estate's own ledger on
 * 2026-09-20. Gmail fetched a tracking pixel twenty-four seconds after send
 * and presented an ordinary Windows Chrome user agent, so the user-agent-based
 * detector recorded it as a human open — the exact inflation the detector
 * exists to prevent. It is pinned here so that cannot come back.
 *
 * Run: npx tsx scripts/check-proxy-detection.ts
 */
import { proxyProvider } from "../src/lib/tracking/store";

const CASES: {
  label: string;
  ua: string | null;
  ip: string | null;
  asn: number | null;
  expect: string | null;
}[] = [
  {
    label: "Gmail fetch, real event from the ledger",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    ip: "74.125.217.32",
    asn: 15169,
    expect: "Google",
  },
  {
    label: "the same fetch with no ASN available",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    ip: "74.125.217.32",
    asn: null,
    // Honest about the limit: without the ASN this is indistinguishable from a
    // person on Windows, and the detector should not pretend otherwise.
    expect: null,
  },
  {
    label: "Google's proxy naming itself, no ASN",
    ua: "Mozilla/5.0 (Windows NT 5.1; rv:11.0) Gecko GoogleImageProxy",
    ip: "66.249.84.1",
    asn: null,
    expect: "Google",
  },
  {
    label: "Apple Mail Privacy Protection",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
    ip: "17.58.12.4",
    asn: 714,
    expect: "Apple",
  },
  {
    label: "Outlook link prefetch",
    ua: "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36",
    ip: "40.94.1.1",
    asn: 8075,
    expect: "Microsoft",
  },
  {
    label: "no user agent at all",
    ua: null,
    ip: "1.2.3.4",
    asn: null,
    expect: "unknown fetcher",
  },
  {
    label: "a person on a South African ISP",
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    ip: "196.25.245.234",
    asn: 3741,
    expect: null,
  },
  {
    label: "a person on a Mac, not on Apple's network",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
    ip: "105.186.2.10",
    asn: 3741,
    expect: null,
  },
];

let failures = 0;

for (const c of CASES) {
  const got = proxyProvider(c.ua, c.ip, c.asn);
  if (got === c.expect) {
    console.log(`  ok    ${c.label.padEnd(44)} → ${got ?? "human"}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${c.label.padEnd(44)} → ${got ?? "human"} (expected ${c.expect ?? "human"})`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} proxy-detection case(s) failed.`);
  process.exit(1);
}
console.log("\nProxy detection matches every pinned case.");
