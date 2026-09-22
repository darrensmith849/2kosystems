import Link from "next/link";
import { WEB_TIERS } from "@/lib/websites";

export default function WebsiteTierSwitcher({ activeSlug }: { activeSlug: string }) {
  return (
    <nav className="wts" aria-label="Website offerings">
      <span className="wts-label">CHOOSE THE RIGHT BUILD</span>
      <div className="wts-options">
        {WEB_TIERS.map((tier) => {
          const active = tier.slug === activeSlug;
          return (
            <Link
              key={tier.slug}
              href={`/websites/${tier.slug}`}
              className="wts-option"
              aria-current={active ? "page" : undefined}
            >
              <span>{tier.name}</span>
              <small>{tier.price}</small>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
