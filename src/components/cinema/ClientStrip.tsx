/**
 * The client strip.
 *
 * Names, not logos. Three reasons: a colour logo wall on a near-black page
 * looks like a ransom note unless every mark is individually treated, wordmarks
 * cost nothing to load on the one page we pay per click for, and setting
 * someone else's trademark in our own type is a smaller claim than reproducing
 * their brand asset.
 *
 * The framing matters more than the design here. These are companies the 2KO
 * Group has delivered work for — training, IT and systems. They are NOT
 * website clients, and the caption must never let the page imply otherwise.
 * Three of them are banks and one is the revenue service.
 *
 * Sourced from the group's own sixsigmasouthafrica.co.za, where they are
 * already published.
 */

const CLIENTS = [
  "Anglo American",
  "Transnet",
  "Standard Bank",
  "SARS",
  "Toyota",
  "Nedbank",
  "John Deere",
  "ABSA",
  "Airports Company",
  "WorldNet",
];

export default function ClientStrip() {
  return (
    <section className="k-clients" aria-label="Companies the 2KO Group has worked with">
      <div className="k-shell">
        <p className="k-clients-head">
          <span className="k-mono k-mono--ember">SOME OF WHO WE HAVE WORKED WITH</span>
          <span className="k-clients-note">
            Across the 2KO Group — training, IT and systems, since 2001.
          </span>
        </p>
      </div>

      <div className="k-clients-rail">
        {/* Duplicated once so the translation can loop seamlessly. The copy is
            hidden from assistive tech to avoid reading every name twice. */}
        <ul className="k-clients-track">
          {CLIENTS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <ul className="k-clients-track" aria-hidden>
          {CLIENTS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
