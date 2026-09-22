import type { Metadata } from "next";
import EnquiryDecisionTree from "@/components/cinema/EnquiryDecisionTree";

export const metadata: Metadata = {
  title: "Internal Enquiry Decision Playbook",
  description: "2KO internal decision-by-decision operating playbook from enquiry intake to controlled delivery.",
  robots: { index: false, follow: false, nocache: true },
};

export default function InternalEnquiryRoutingPage() {
  return (
    <main>
      <EnquiryDecisionTree />
    </main>
  );
}
