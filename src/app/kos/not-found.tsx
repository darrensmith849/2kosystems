import Link from "next/link";
import KosNav from "@/components/kos/KosNav";
import KosFooter from "@/components/kos/KosFooter";

export default function KosNotFound() {
  return (
    <>
      <KosNav />
      <main className="k-shell" style={{ minHeight: "60svh", paddingBlock: "clamp(64px, 10vw, 140px)" }}>
        <p className="k-mono k-mono--ember">Page not found</p>
        <h1 className="k-state" style={{ marginTop: 14 }}>
          That page isn&apos;t here.
        </h1>
        <div className="ks-actions">
          <Link href="/" className="k-btn k-btn--solid">
            Go to the home page
          </Link>
          <Link href="/apply" className="k-btn k-btn--ghost">
            Become a partner
          </Link>
        </div>
      </main>
      <KosFooter />
    </>
  );
}
