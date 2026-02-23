import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { LanguageChart } from "@/components/dashboard/language-chart";
import { RecentConversations } from "@/components/dashboard/recent-conversations";
import { PremiumCard } from "@/components/dashboard/premium-card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full w-full bg-muted/20">
      <DashboardNavbar />
      <div className="flex-1 space-y-6 p-8 pt-6 overflow-y-auto">
        <StatsCards />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 lg:col-span-4">
            <AnalyticsChart />
          </div>
          <div className="col-span-3 lg:col-span-3">
            <LanguageChart />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 lg:col-span-5">
            <RecentConversations />
          </div>
          <div className="col-span-3 lg:col-span-2">
            <PremiumCard />
          </div>
        </div>
      </div>
    </div>
  );
}
