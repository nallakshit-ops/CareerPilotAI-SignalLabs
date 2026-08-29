import { getIndustryInsights, getCandidateDashboardStats } from "@/actions/dashboard";
import { getUserOnboardingStatus } from "@/actions/user";
import { getCandidateSignals } from "@/actions/signals";
import { redirect } from "next/navigation";
import DashboardTabs from "./_components/dashboard-tabs";

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const [insights, growthStats, signalData] = await Promise.all([
    getIndustryInsights(),
    getCandidateDashboardStats(),
    getCandidateSignals().catch(() => ({ signals: [], summary: {} })),
  ]);

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <DashboardTabs
        insights={insights}
        growthStats={growthStats}
        signalData={signalData}
      />
    </div>
  );
}

