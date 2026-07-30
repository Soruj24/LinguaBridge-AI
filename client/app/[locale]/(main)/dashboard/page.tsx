import { DashboardNavbarWrapper } from "@/components/features/dashboard/components/dashboard-navbar-wrapper";
import { StatsCards } from "@/components/features/dashboard/components/stats-cards";
import { AnalyticsChart } from "@/components/features/dashboard/components/analytics-chart";
import { LanguageChart } from "@/components/features/dashboard/components/language-chart";
import { RecentConversations } from "@/components/features/dashboard/components/recent-conversations";
import { PremiumCard } from "@/components/features/dashboard/components/premium-card";
import { WelcomeBanner } from "@/components/features/dashboard/components/welcome-banner";
import { FriendRequestsCard } from "@/components/features/dashboard/components/friend-requests-card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <DashboardNavbarWrapper />
      <div className="flex-1 space-y-6 p-4 md:p-6 pb-20 md:pb-6 overflow-y-auto">
        <WelcomeBanner />
        <StatsCards />

        <div className="grid gap-6 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <AnalyticsChart />
          </div>
          <div className="lg:col-span-3">
            <LanguageChart />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          <div className="lg:col-span-5">
            <RecentConversations />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <FriendRequestsCard />
            <PremiumCard />
          </div>
        </div>
      </div>
    </div>
  );
}
