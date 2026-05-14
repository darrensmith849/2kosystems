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
      <main style={{ paddingTop: "var(--topbar-h)" }}>{children}</main>
      <Footer />
    </ChatWidget>
  );
}
