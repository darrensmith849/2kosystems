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
 * `scale` is optical, not mathematical. A square mark reads heavier than a
 * wordmark at the same height, so the square ones are set smaller until the row
 * looks evenly weighted.
 */

type Client = { name: string; file: string; ratio: number; scale: number };

const CLIENTS: Client[] = [
  { name: "Anglo American", file: "anglo-american", ratio: 4.54, scale: 1 },
  { name: "Toyota", file: "toyota", ratio: 1.47, scale: 0.86 },
  { name: "Eskom", file: "eskom", ratio: 3.91, scale: 1 },
  { name: "Absa", file: "absa", ratio: 1, scale: 0.76 },
  { name: "Discovery", file: "discovery", ratio: 4.89, scale: 1 },
  { name: "MTN", file: "mtn", ratio: 2, scale: 0.86 },
  { name: "Transnet", file: "transnet", ratio: 7.9, scale: 0.82 },
  { name: "Sanlam", file: "sanlam", ratio: 4.87, scale: 1 },
  { name: "John Deere", file: "john-deere", ratio: 1.11, scale: 0.9 },
  { name: "Airports Company South Africa", file: "acsa", ratio: 2.19, scale: 0.95 },
  { name: "Nedbank", file: "nedbank", ratio: 0.98, scale: 0.76 },
  { name: "Coca-Cola", file: "coca-cola", ratio: 3.2, scale: 0.95 },
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
              ["--scale" as string]: c.scale,
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
