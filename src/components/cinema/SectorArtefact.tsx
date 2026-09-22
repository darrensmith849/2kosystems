import type { ReactNode } from "react";

/**
 * One record per sector.
 *
 * The four sector sections each carried the same Panel — a metric, a sparkline
 * and four readouts — so the page said "the vocabulary changes, the failure
 * does not" while showing four identical instruments. True, but it made the
 * sectors look interchangeable, which is the opposite of the point.
 *
 * Each one now shows the document that sector actually runs on: a permit, a
 * pallet's trace, a proof of delivery, a control check. The vocabulary really
 * is different; only the shape underneath repeats.
 *
 * Invented records throughout. No client's data, no real site names.
 */

export type SectorKind = "mining" | "agriculture" | "logistics" | "manufacturing";

export default function SectorArtefact({ kind }: { kind: SectorKind }) {
  if (kind === "mining") return <Permit />;
  if (kind === "agriculture") return <Trace />;
  if (kind === "logistics") return <Pod />;
  return <Quality />;
}

function Sheet({ label, meta, children }: { label: string; meta: string; children: ReactNode }) {
  return (
    <div className="k-art">
      <div className="k-art-head">
        <span className="k-art-label">{label}</span>
        <span className="k-art-meta">{meta}</span>
      </div>
      <div className="k-art-body">{children}</div>
    </div>
  );
}

/** Mining — the permit, and the isolation nobody can sign around. */
function Permit() {
  return (
    <Sheet label="Permit to work · PTW-2214" meta="Section 4 East">
      <p className="k-art-doc-title">Belt conveyor guard replacement · hot work</p>
      <ul className="k-art-rows">
        <li>
          <b>Isolation points</b>
          <i>3 of 3 locked · photographs attached</i>
        </li>
        <li>
          <b>Gas test</b>
          <i>Clear · 07:12, valid 4 hrs</i>
        </li>
      </ul>
      <ul className="k-art-sign">
        <li data-s="done">
          <b>Issuing authority</b>
          <i>07:20</i>
        </li>
        <li data-s="done">
          <b>Performing authority</b>
          <i>07:26</i>
        </li>
        <li data-s="now">
          <b>Competency check</b>
          <i>Contractor cert expires in 6 days</i>
        </li>
      </ul>
      <p className="k-art-foot">
        The permit <b>cannot be issued</b> against an expired certification. That is the
        control — not a reminder to check one.
      </p>
    </Sheet>
  );
}

/** Agriculture — one pallet, all the way back to the block. */
function Trace() {
  return (
    <Sheet label="Traceability · PLT-88431" meta="8 seconds to answer">
      <ul className="k-art-chain-v">
        <li data-s="done">
          <b>Block C7 · Row 12</b>
          <i>Picked 04:40 · crew 3</i>
        </li>
        <li data-s="done">
          <b>Weighbridge intake</b>
          <i>1,240 kg · graded Class 1</i>
        </li>
        <li data-s="done">
          <b>Cold store bay 2</b>
          <i>In at 06:15 · 2.1 °C</i>
        </li>
        <li data-s="now">
          <b>Pallet PLT-88431</b>
          <i>Sealed 11:02 · compliance pack generated</i>
        </li>
      </ul>
      <p className="k-art-foot">
        A buyer asks which block a pallet came from. Nobody goes looking for the
        paperwork, because <b>the paperwork was never separate from the work</b>.
      </p>
    </Sheet>
  );
}

/** Logistics — the delivery, and the exception that pays for itself. */
function Pod() {
  return (
    <Sheet label="Proof of delivery · CON-70255" meta="Captured by the driver">
      <ul className="k-art-rows">
        <li>
          <b>Delivered</b>
          <i>14:38 · signature and 2 photographs</i>
        </li>
        <li>
          <b>Pallets</b>
          <i>11 of 12 accepted</i>
        </li>
      </ul>
      <div className="k-art-exc">
        <p className="k-art-exc-h">Exception raised on the spot</p>
        <p className="k-art-exc-b">
          1 pallet refused · damage photographed at the tailgate, timestamped and
          geotagged before the truck moved.
        </p>
      </div>
      <ul className="k-art-rows">
        <li>
          <b>Claim window</b>
          <i data-ok="1">Lodged in 4 hrs · limit 48</i>
        </li>
        <li>
          <b>Recovered from sub-contractor</b>
          <i data-ok="1">R6,180</i>
        </li>
      </ul>
      <p className="k-art-foot">
        On thin margins an unrecovered exception is the quarter. The recovery depends
        entirely on <b>evidence captured before the truck pulled away</b>.
      </p>
    </Sheet>
  );
}

/** Manufacturing — the control that does not depend on somebody remembering. */
function Quality() {
  return (
    <Sheet label="In-line check · Line 2, shift B" meta="Control plan 14-C">
      <div className="k-art-spec">
        <span className="k-art-spec-bar" aria-hidden>
          <i className="k-art-spec-lsl" />
          <i className="k-art-spec-usl" />
          <i className="k-art-spec-dot" style={{ left: "74%" }} />
        </span>
        <span className="k-art-spec-legend">
          <em>LSL 4.80</em>
          <em>Reading 5.31</em>
          <em>USL 5.20</em>
        </span>
      </div>
      <ul className="k-art-rows">
        <li>
          <b>Result</b>
          <i data-warn="1">Out of specification · rejected on entry</i>
        </li>
        <li>
          <b>Non-conformance</b>
          <i>NCR-0912 raised automatically</i>
        </li>
        <li>
          <b>Line status</b>
          <i data-warn="1">Held · 2 operators notified</i>
        </li>
      </ul>
      <p className="k-art-foot">
        The Green Belt&rsquo;s control plan said <b>&ldquo;operator checks hourly&rdquo;</b>.
        This is that plan written in code, which is why the gain has not decayed.
      </p>
    </Sheet>
  );
}
