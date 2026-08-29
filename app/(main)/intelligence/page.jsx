import { getUserOnboardingStatus } from "@/actions/user";
import { getCandidateSignals } from "@/actions/signals";
import { redirect } from "next/navigation";
import SignalsView from "@/components/signals/signals-view";

export const metadata = {
  title: "Career Signal Intelligence | CareerPilot AI",
  description: "Proactive AI-native career signals, risk predictions, and actionable intelligence.",
};

export default async function IntelligencePage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const initialData = await getCandidateSignals();

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <SignalsView initialData={initialData} />
    </div>
  );
}
