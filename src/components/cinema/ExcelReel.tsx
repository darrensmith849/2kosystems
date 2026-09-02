"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The spreadsheet, becoming a system.
 *
 * /get-off-excel described the product in words and showed a five-stage
 * pipeline diagram — which is the same diagram every consultancy draws. The one
 * thing this page has that nothing else on the site has is that every visitor
 * already owns the artefact it is about. So show it: the merged cell, the
 * #REF!, the three date formats, the name typed into a notes column.
 *
 * Four beats — the file as it is, the read, the rebuild, the system running —
 * which is the whole four-week engagement in about fourteen seconds.
 *
 * Everything is invented. The filename is not: some version of it is on every
 * shared drive in the country.
 */

type Beat = {
  n: string;
  title: string;
  note: string;
  kind: "file" | "read" | "build" | "live";
};

const BEATS: Beat[] = [
  { n: "01", title: "The file, as it is", note: "Six problems visible without scrolling", kind: "file" },
  { n: "02", title: "Reading it", note: "Every column typed, every rule inferred", kind: "read" },
  { n: "03", title: "Rebuilding it", note: "The rules become validation", kind: "build" },
  { n: "04", title: "Live", note: "One set of records, three people, full history", kind: "live" },
];

const DWELL = 3600;
const SWAP = 170;

export default function ExcelReel() {
  const [index, setIndex] = useState(0);
  const [live, setLive] = useState(true);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    if (live) {
      const id = setTimeout(() => setLive(false), DWELL);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % BEATS.length);
      setLive(true);
    }, SWAP);
    return () => clearTimeout(id);
  }, [active, live, index]);

  const beat = BEATS[index];
  const before = beat.kind === "file" || beat.kind === "read";

  return (
    <div className="k-xl" ref={ref}>
      <div className="k-reel-frame">
        {/* ------------------------------------------------------ title bar */}
        <div className="k-xl-bar" data-before={before}>
          <span className="k-reel-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="k-xl-name">
            {before ? "Stock Register Final_v3_USE_THIS_ONE.xlsx" : "Stock Register · live"}
          </span>
          <span className="k-xl-state">
            {before ? "Read-only · locked by D. Nkosi" : "3 people · saving as you type"}
          </span>
        </div>

        {/* ---------------------------------------------------- the stage */}
        <div className="k-xl-view" aria-hidden>
          <div key={index} className={`k-xl-card${live ? " is-in" : ""}`}>
            <Stage kind={beat.kind} />
          </div>
        </div>

        {/* ---------------------------------------------------- the beats */}
        <ol className="k-xl-beats">
          {BEATS.map((b, i) => (
            <li key={b.n} data-state={i === index ? "on" : i < index ? "done" : "off"}>
              <span className="k-xl-n">{b.n}</span>
              <span className="k-xl-t">{b.title}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="k-reel-caption">
        <span className="k-reel-caption-label">{beat.note}</span>
        <span className="k-reel-caption-note">
          Illustrative. An invented register, and a filename you have probably seen.
        </span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ stages */

const DIRTY_HEAD = ["Item", "Qty", "Location", "Last count", "Notes"];

/** The rows carry the faults the copy on this page describes. */
const DIRTY: { cells: string[]; bad?: number[] }[] = [
  { cells: ["Bearing 6205-2RS", "48", "Store A", "03/04/2024", ""] },
  { cells: ["Bearing 6205 2RS", "12 units", "store a", "4 Mar", "dup?"], bad: [0, 1, 2, 3] },
  { cells: ["V-belt B52", "#REF!", "Store A", "45356", "ask Thabo"], bad: [1, 3, 4] },
  { cells: ["Hyd. hose 3/4", "~30", "Store B", "", "counted by JM"], bad: [1, 3, 4] },
  { cells: ["Gasket set — CAT", "6", "Store B", "12/03/24", ""] },
];

/**
 * The same register after the rebuild — and it has to actually be different.
 * The duplicate is merged, the quantities are integers, the dates are one
 * format, the broken reference is resolved, and "counted by JM" has become a
 * column of its own, which is what beat 02 promised would happen to it.
 */
const CLEAN_HEAD = ["Item", "Qty", "Location", "Last count", "Counted by"];

const CLEAN: string[][] = [
  ["Bearing 6205-2RS", "60", "Store A", "2024-03-04", "J. Mokoena"],
  ["V-belt B52", "18", "Store A", "2024-03-04", "J. Mokoena"],
  ["Hyd. hose 3/4", "30", "Store B", "2024-03-12", "J. Mokoena"],
  ["Gasket set — CAT", "6", "Store B", "2024-03-12", "T. Dlamini"],
];

function Sheet({ clean = false }: { clean?: boolean }) {
  const head = clean ? CLEAN_HEAD : DIRTY_HEAD;
  const rows = clean ? CLEAN.map((cells) => ({ cells, bad: undefined })) : DIRTY;
  return (
    <table className="k-xl-sheet" data-clean={clean ? "1" : "0"}>
      <thead>
        <tr>
          <th className="k-xl-rn" />
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          <tr key={ri}>
            <td className="k-xl-rn">{ri + 2}</td>
            {r.cells.map((c, ci) => (
              <td key={ci} data-bad={!clean && r.bad?.includes(ci) ? "1" : undefined}>
                {c || <span className="k-xl-empty">—</span>}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Stage({ kind }: { kind: Beat["kind"] }) {
  if (kind === "file") {
    return (
      <div className="k-xl-file">
        <Sheet />
        <ul className="k-xl-faults">
          <li>Same bearing, twice, spelled two ways</li>
          <li>Quantity as a number, a phrase and a guess</li>
          <li>Three date formats and one serial</li>
          <li>A broken reference nobody has fixed</li>
          <li>A person&rsquo;s name living in a notes column</li>
        </ul>
      </div>
    );
  }

  if (kind === "read") {
    const cols = [
      { c: "Item", t: "Text · required · unique", ok: true },
      { c: "Qty", t: "Integer · ≥ 0 · required", ok: true },
      { c: "Location", t: "List of 2 · from the data", ok: true },
      { c: "Last count", t: "Date · 3 formats reconciled", ok: true },
      { c: "Notes", t: "Split — 'counted by' becomes a person", ok: false },
    ];
    return (
      <div className="k-xl-read">
        <ul className="k-xl-cols">
          {cols.map((c, i) => (
            <li key={c.c} style={{ animationDelay: `${i * 110}ms` }} data-split={c.ok ? "0" : "1"}>
              <b>{c.c}</b>
              <i>{c.t}</i>
            </li>
          ))}
        </ul>
        <p className="k-xl-foot">
          <b>1,847 rows read.</b> The spreadsheet is the specification — nobody has to
          write one.
        </p>
      </div>
    );
  }

  if (kind === "build") {
    return (
      <div className="k-xl-build">
        <div className="k-xl-form">
          <label>
            <span>Item</span>
            <b>Bearing 6205-2RS</b>
          </label>
          <label>
            <span>Qty</span>
            <b>12 units</b>
            <em>Whole number only</em>
          </label>
          <label>
            <span>Location</span>
            <b>Store A</b>
          </label>
          <label>
            <span>Counted by</span>
            <b>J. Mokoena</b>
          </label>
        </div>
        <p className="k-xl-foot">
          <b>Rejected on entry.</b> The bad value never reaches the register, which is
          the difference between a system and a shared file.
        </p>
      </div>
    );
  }

  return (
    <div className="k-xl-live">
      <Sheet clean />
      <ul className="k-xl-audit">
        <li>
          <em>14:02</em> J. Mokoena set Qty 48 → 60 · duplicate row merged
        </li>
        <li>
          <em>14:02</em> D. Nkosi viewing · no lock, no copy
        </li>
        <li>
          <em>02:00</em> Backup completed · restore tested
        </li>
      </ul>
    </div>
  );
}
