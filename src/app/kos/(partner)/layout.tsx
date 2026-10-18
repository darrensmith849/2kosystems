import KosNav from "@/components/kos/KosNav";
import KosFooter from "@/components/kos/KosFooter";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <KosNav />
      <main>{children}</main>
      <KosFooter />
    </>
  );
}
