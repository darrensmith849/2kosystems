/**
 * The client strip.
 *
 * Real logos, rendered as CSS masks rather than images. A mask throws away the
 * source colour entirely and paints the shape in one grey, which is how a broad
 * group of unrelated brand palettes can share one near-black strip without
 * becoming visually noisy. It also means a logo drawn dark-on-white — most of
 * them — does not disappear against our background.
 *
 * Every company here is supported by the group's client records. The expanded
 * set is deliberately weighted toward recognisable organisations and a wider
 * mix of sectors rather than simply displaying every corporate email domain.
 *
 * The source SVGs have been cropped to their measured ink bounds. The ratio is
 * recorded here so horizontal wordmarks and compact marks retain a consistent
 * visual height without stretching.
 */

type Client = { name: string; file: string; ratio: number };

const CLIENTS: Client[] = [
  { name: "Anglo American", file: "anglo-american", ratio: 4.54 },
  { name: "Hollard", file: "hollard", ratio: 3.48 },
  { name: "NTT", file: "ntt", ratio: 3.03 },
  { name: "Toyota", file: "toyota", ratio: 3.29 },
  { name: "Merchants", file: "merchants", ratio: 5.45 },
  { name: "Transnet", file: "transnet", ratio: 7.9 },
  { name: "Discovery", file: "discovery", ratio: 4.53 },
  { name: "Amrod", file: "amrod", ratio: 2.91 },
  { name: "Emirates Global Aluminium", file: "ega", ratio: 3.41 },
  { name: "Telkom", file: "telkom", ratio: 3.98 },
  { name: "Roche", file: "roche", ratio: 1.71 },
  { name: "FNB", file: "fnb", ratio: 5.86 },
  { name: "Komatsu", file: "komatsu", ratio: 4.84 },
  { name: "Sanlam", file: "sanlam", ratio: 4.87 },
  { name: "Mondelēz International", file: "mondelez", ratio: 3.86 },
  { name: "Quantanite", file: "quantanite", ratio: 4.44 },
  { name: "Eskom", file: "eskom", ratio: 3.91 },
  { name: "Nedbank", file: "nedbank", ratio: 2.08 },
  { name: "Mpact", file: "mpact", ratio: 2.12 },
  { name: "Coca-Cola", file: "coca-cola", ratio: 3.2 },
  { name: "Standard Bank", file: "standard-bank", ratio: 3.18 },
  { name: "Monocle", file: "monocle", ratio: 3.4 },
  { name: "DHL", file: "dhl", ratio: 6.53 },
  { name: "Santam", file: "santam", ratio: 2.76 },
  { name: "Saint-Gobain", file: "saint-gobain", ratio: 3.32 },
  { name: "Outworx", file: "outworx", ratio: 3.24 },
  { name: "Nampak", file: "nampak", ratio: 4.18 },
  { name: "Sasol", file: "sasol", ratio: 2.66 },
  { name: "ARB Electrical Wholesalers", file: "arb", ratio: 5.45 },
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
    <section className="k-clients" aria-label="Organisations served across the 2KO Group">
      <div className="k-shell">
        <p className="k-clients-head">
          <span className="k-mono k-mono--ember">ORGANISATIONS SERVED ACROSS THE 2KO GROUP</span>
          <span className="k-clients-note">
            Relationships spanning training, consulting and systems.
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
