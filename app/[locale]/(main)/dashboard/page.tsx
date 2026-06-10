import { DashboardNavbarWrapper } from "@/components/dashboard/dashboard-navbar-wrapper";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { LanguageChart } from "@/components/dashboard/language-chart";
import { RecentConversations } from "@/components/dashboard/recent-conversations";
import { PremiumCard } from "@/components/dashboard/premium-card";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { FriendRequestsCard } from "@/components/dashboard/friend-requests-card";

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
