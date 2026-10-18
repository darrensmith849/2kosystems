import type { Metadata } from "next";
import { PRIVACY_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What 2KO Systems collects on this website, and why.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <section className="k-shell" style={{ paddingBlock: "clamp(56px, 8vw, 104px)" }}>
      <div className="ks-prose">
        <p className="k-mono k-mono--ember">Privacy</p>
        <h1 className="k-state" style={{ marginTop: 14 }}>
          Your information on this site.
        </h1>
        <p>This page covers the 2kosystems.com website. 2KO Systems is part of 2KO.</p>
        <h2>What we collect</h2>
        <p>
          When you fill in the partner form we keep what you typed: your name, email, phone number, business name and
          your answers. We also note the page you came from and roughly which country you&apos;re in.
        </p>
        <h2>Why</h2>
        <p>To reply to you and talk about becoming a partner. We don&apos;t sell it, and we don&apos;t use it for anything else.</p>
        <h2>Who sees it</h2>
        <p>
          The 2KO team. It is stored with Cloudflare, who host this site. A security check from Cloudflare (Turnstile)
          runs on the form to keep out bots.
        </p>
        <h2>Your rights</h2>
        <p>
          You can ask to see, fix or delete what we hold about you at any time. Email{" "}
          <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
        </p>
      </div>
    </section>
  );
}
