import Link from "next/link";

export default function KosFooter() {
  return (
    <footer className="ks-foot">
      <div className="k-shell ks-foot-in">
        <span>
          <span style={{ fontFamily: "var(--font-ko-mark)", color: "var(--warm)" }}>2KO</span> Systems · Tools you sell
          under your own name
        </span>
        <nav aria-label="Footer">
          <Link href="/apply">Become a partner</Link>
          <Link href="/kit/demo">See a client page</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="https://www.2ko.co.za">2KO consulting</a>
        </nav>
      </div>
    </footer>
  );
}
