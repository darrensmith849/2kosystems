import type { Metadata } from "next";
import ProcessReviewDecisionTree from "@/components/cinema/ProcessReviewDecisionTree";

export const metadata: Metadata = {
  title: "Internal Half-Day Process Review Playbook",
  description: "2KO internal decision-by-decision playbook for delivering a bounded Half-Day Process Review and defensible decision brief.",
  robots: { index: false, follow: false, nocache: true },
};

export default function InternalProcessReviewPage() {
  return (
    <main>
      <ProcessReviewDecisionTree />
    </main>
  );
}
