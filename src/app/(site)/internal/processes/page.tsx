import type { Metadata } from "next";
import InternalProcessLibrary from "@/components/cinema/InternalProcessLibrary";

export const metadata: Metadata = {
  title: "Internal Process Library",
  description: "2KO internal process register and decision-canvas library.",
  robots: { index: false, follow: false, nocache: true },
};

export default function InternalProcessesPage() {
  return <InternalProcessLibrary />;
}
