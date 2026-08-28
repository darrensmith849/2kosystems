/**
 * The client strip.
 *
 * Real logos, rendered as CSS masks rather than images. A mask throws away the
 * source colour entirely and paints the shape in one grey, which is the only
 * way twelve unrelated brand palettes sit on a near-black page without looking
 * like a ransom note. It also means a logo drawn dark-on-white — most of them —
 * does not disappear against our background.
 *
 * Every company here is on the group's own client list. Two from the Six Sigma
 * site were dropped because no high-quality SVG could be found (SARS, Standard
 * Bank) and one because its SVG was 987 paths and 252KB (Sasol); all three were
 * replaced from the same list.
 *
 * Several viewBoxes were cropped to their measured ink bounds — Transnet to
 * its wordmark alone, because the stacked chevron underneath made the whole
 * lockup unreadable at strip height, and Coca-Cola because its mark filled
 * only 31% of the box it shipped in.
 *
 * Horizontal wordmarks only. Square badges — Absa, Nedbank, John Deere, MTN,
 * ACSA — were dropped even though several are stronger names, because mixing
 * a 1:1 mark with a 5:1 wordmark in one row makes the row look broken however
 * carefully each is scaled. Toyota survives on its wordmark lockup rather than
 * the badge. Everything here is between 3.2:1 and 7.9:1, so a single
 * height is all the sizing the strip needs — no per-logo fudge factors.
 */

type Client = { name: string; file: string; ratio: number };

const CLIENTS: Client[] = [
  { name: "Anglo American", file: "anglo-american", ratio: 4.54 },
  { name: "Telkom", file: "telkom", ratio: 3.98 },
  { name: "Discovery", file: "discovery", ratio: 4.89 },
  { name: "Toyota", file: "toyota", ratio: 3.29 },
  { name: "Transnet", file: "transnet", ratio: 7.9 },
  { name: "Eskom", file: "eskom", ratio: 3.91 },
  { name: "Sanlam", file: "sanlam", ratio: 4.87 },
  { name: "Coca-Cola", file: "coca-cola", ratio: 3.2 },
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="k-clients-track" aria-hidden={hidden || undefined}>
      {CLIENTS.map((c) => (
        <li key={c.file}>
          <span
            className="k-logo"
            role={hidden ? undefined : "img"}
            aria-label={hidden ? undefined : c.name}
            style={{
              ["--logo" as string]: `url(/logos/${c.file}.svg)`,
              ["--ratio" as string]: c.ratio,
            }}
          />
        </li>
      ))}
    </ul>
  );
}

export default function ClientStrip() {
  return (
    <section className="k-clients" aria-label="Companies that have used 2KO software">
      <div className="k-shell">
        <p className="k-clients-head">
          <span className="k-mono k-mono--ember">SOME OF WHO WE HAVE WORKED WITH</span>
          <span className="k-clients-note">
            Companies that have used 2KO software, or had it built for them.
          </span>
        </p>
      </div>

      <div className="k-clients-rail">
        <Row />
        {/* Second copy exists only so the translation can loop seamlessly. */}
        <Row hidden />
      </div>
    </section>
  );
}
