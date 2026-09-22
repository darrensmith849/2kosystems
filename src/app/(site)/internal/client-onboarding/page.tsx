import type { Metadata } from "next";
import ClientOnboardingDecisionTree from "@/components/cinema/ClientOnboardingDecisionTree";

export const metadata: Metadata = {
  title: "Internal Client Onboarding Playbook",
  description: "2KO internal decision-by-decision client onboarding playbook from delivery authorisation to controlled mobilisation.",
  robots: { index: false, follow: false, nocache: true },
};

export default function InternalClientOnboardingPage() {
  return (
    <main>
      <ClientOnboardingDecisionTree />
    </main>
  );
}
