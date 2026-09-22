import type { ReactNode } from "react";
import Nav from "@/components/cinema/Nav";
import Footer from "@/components/cinema/Footer";
import Analytics from "@/components/cinema/Analytics";
import ChatWidget from "@/components/cinema/ChatWidget";

export default function CinemaLayout({ children }: { children: ReactNode }) {
  return (
    <div data-k>
      <Nav />
      <main>{children}</main>
      <Footer />
      <Analytics />
      <ChatWidget />
    </div>
  );
}
