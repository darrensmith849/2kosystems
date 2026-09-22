import type { Report, ReportKind, Row } from "./types.ts";

/** Minimal RFC4180 tokenizer. Google's exports quote any cell containing a comma. */
function tokenize(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (c !== "\r") cell += c;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export function normalise(header: string): string {
  return header
    .toLowerCase()
    .replace(/[().]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Google writes " --" for "no data", thousands separators inside quotes, and
 * percentages as "3.66%". Anything non-numeric comes back as the trimmed string.
 */
function coerce(raw: string): string | number | null {
  const v = raw.trim();
  if (v === "" || v === "--" || v === "-") return null;
  if (/^-?[\d,]+\.?\d*%$/.test(v)) return parseFloat(v.replace(/[,%]/g, "")) / 100;
  if (/^-?[\d,]+\.?\d*$/.test(v)) return parseFloat(v.replace(/,/g, ""));
  return v;
}

const SIGNATURES: { kind: ReportKind; needs: string[]; forbids?: string[] }[] = [
  { kind: "search_terms", needs: ["search_term"] },
  { kind: "negatives", needs: ["negative_keyword"] },
  { kind: "conversion_actions", needs: ["conversion_action"] },
  { kind: "keywords", needs: ["keyword", "match_type"], forbids: ["search_term"] },
  { kind: "campaign", needs: ["campaign", "bid_strategy_type"], forbids: ["keyword", "ad_group"] },
  { kind: "ad_groups", needs: ["ad_group"], forbids: ["keyword", "search_term"] },
];

function detect(headers: string[]): ReportKind | null {
  const keys = headers.map(normalise);
  const has = (frag: string) => keys.some((k) => k.includes(frag));
  for (const sig of SIGNATURES) {
    if (sig.needs.every(has) && !(sig.forbids ?? []).some(has)) return sig.kind;
  }
  return null;
}

export function parseReport(text: string): Report | null {
  const raw = tokenize(text).filter((r) => r.some((c) => c.trim() !== ""));
  if (!raw.length) return null;

  // Line 0 is the report name, line 1 the date range, line 2 the header. Rather
  // than trust that, take the first row wide enough to be a header.
  const headerIndex = raw.findIndex((r) => r.length >= 5);
  if (headerIndex === -1) return null;

  const headers = raw[headerIndex].map((h) => h.trim());
  const kind = detect(headers);
  if (!kind) return null;

  const preamble = raw.slice(0, headerIndex).map((r) => r[0]?.trim() ?? "");
  const window = preamble.find((l) => /\d{4}/.test(l) && l.includes("-")) ?? null;
  const title = preamble[0] ?? kind;

  const keys = headers.map(normalise);
  const rows: Row[] = [];
  const totals: Row[] = [];

  for (const line of raw.slice(headerIndex + 1)) {
    const row: Row = {};
    keys.forEach((k, i) => {
      row[k] = coerce(line[i] ?? "");
    });
    const first = String(line[0] ?? "").trim();
    if (first.startsWith("Total:") || first === "Total") totals.push(row);
    else rows.push(row);
  }

  return { kind, title, window, headers, rows, totals };
}

export function num(row: Row, ...aliases: string[]): number {
  for (const a of aliases) {
    const v = row[a];
    if (typeof v === "number") return v;
  }
  return 0;
}

export function str(row: Row, ...aliases: string[]): string {
  for (const a of aliases) {
    const v = row[a];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/** Parse "May 30, 2026 - August 27, 2026" into a day count. Defaults to 90. */
export function windowDays(window: string | null): number {
  if (!window) return 90;
  const parts = window.split(/\s+-\s+/);
  if (parts.length !== 2) return 90;
  const a = Date.parse(parts[0].replace(/"/g, ""));
  const b = Date.parse(parts[1].replace(/"/g, ""));
  if (Number.isNaN(a) || Number.isNaN(b)) return 90;
  return Math.max(1, Math.round((b - a) / 86_400_000) + 1);
}
