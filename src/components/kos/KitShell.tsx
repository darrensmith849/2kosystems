import Link from "next/link";
import { kitBase, type Partner } from "@/lib/kos/partners";

/** The frame around every client page: the partner's name, nothing of ours. */
export default function KitShell({ partner, children }: { partner: Partner; children: React.ReactNode }) {
  return (
    <div style={{ ["--c" as string]: partner.colour, ["--ember" as string]: partner.colour }}>
      {partner.demo ? (
        <p className="ks-kit-preview">
          Preview of a client page. Partners get this with their own name on it. <Link href="/apply">Become a partner</Link>
        </p>
      ) : null}
      <header className="ks-kit-bar">
        <div className="k-shell">
          <div className="ks-top-in">
            <Link href={kitBase(partner)} className="ks-kit-name">
              <i>{partner.name.charAt(0)}</i>
              {partner.name}
            </Link>
            {partner.website ? (
              <a href={partner.website} className="k-sm">
                Visit {partner.name}
              </a>
            ) : null}
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="ks-foot">
        <div className="k-shell ks-foot-in">
          <span>Brought to you by {partner.name}</span>
        </div>
      </footer>
    </div>
  );
}
