import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatWidget>
      <Header />
      <main className="pt-[65px]">{children}</main>
      <Footer />
    </ChatWidget>
  );
}
