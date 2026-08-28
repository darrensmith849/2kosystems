import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import { LADDER, LOGIN_TEST } from "@/lib/ladder";

/**
 * The band that joins the two halves of the business.
 *
 * Websites and systems were sold as separate things by separate pages. They are
 * not separate — they are one ladder with a seam in it, and the rungs either
 * side of that seam cost within R5,000 of each other. Showing the whole ladder
 * on both sides is more honest than either page pretending the other is a
 * different company, and it lets someone who arrived asking for a website find
 * the thing they actually needed without having to know our vocabulary.
 *
 * `here` lights the rung the visitor is standing on.
 */
export default function Crossover({ here }: { here?: string }) {
  return (
    <section className="k-band k-band--panel">
      <div className="k-shell">
        <Rise>
          <p className="k-mono">WHERE THIS SITS</p>
          <h2 className="k-title k-web-h2">One ladder, not two businesses.</h2>
          <p className="k-lead k-measure">
            A website and a system are the same work at different depths, and the
            rungs either side of the join cost within R5,000 of each other. So
            here is the whole thing, in order, rather than two price lists that
            pretend the other does not exist.
          </p>
        </Rise>

        {/* --------------------------------------------------------- the test */}
        <Rise step={1}>
          <div className="k-xtest">
            <p className="k-xtest-q">The test is who logs in.</p>
            <ul className="k-xtest-list">
              {LOGIN_TEST.map((t) => (
                <li key={t.who}>
                  <Link href={t.href} className="k-xtest-row">
                    <span className="k-xtest-who">{t.who}</span>
                    <span className="k-xtest-then">{t.then}</span>
                    <span className="k-xtest-where">{t.where} ↗</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Rise>

        {/* ------------------------------------------------------- the ladder */}
        <Rise step={2}>
          <ol className="k-ladder">
            {LADDER.map((r) => (
              <li key={r.name} data-seam={r.seam} data-side={r.side}>
                {r.seam && (
                  <p className="k-ladder-seam">
                    <span>
                      From here on the buyer is operations, not the owner — and the
                      decision takes a quarter, not a week
                    </span>
                  </p>
                )}
                <Link
                  href={r.href}
                  className="k-ladder-rung"
                  aria-current={r.name === here ? "page" : undefined}
                >
                  <span className="k-ladder-name">{r.name}</span>
                  <span className="k-ladder-what">{r.what}</span>
                  <span className="k-ladder-time">{r.time}</span>
                  <span className="k-ladder-price">{r.price}</span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="k-ladder-foot">
            Ex VAT, fixed against the scope agreed in week one. Tell us the problem
            rather than the tier — we will say which rung it actually is, including
            when that is a cheaper one than you asked about.
          </p>
        </Rise>
      </div>
    </section>
  );
}
