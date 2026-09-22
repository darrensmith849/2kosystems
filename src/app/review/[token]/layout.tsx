import type { ReactNode } from "react";
import Nav from "@/components/cinema/Nav";
import Footer from "@/components/cinema/Footer";

export default function ReviewLayout({ children }: { children: ReactNode }) {
  return (
    <div data-k>
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
