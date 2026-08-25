import type { ReactNode } from "react";
import Nav from "@/components/cinema/Nav";
import Footer from "@/components/cinema/Footer";
import ChatWidget from "@/components/cinema/ChatWidget";

export default function CinemaLayout({ children }: { children: ReactNode }) {
  return (
    <div data-k>
      <Nav />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
