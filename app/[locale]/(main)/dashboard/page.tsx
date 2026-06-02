import { DashboardNavbarWrapper } from "@/components/dashboard/dashboard-navbar-wrapper";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { LanguageChart } from "@/components/dashboard/language-chart";
import { RecentConversations } from "@/components/dashboard/recent-conversations";
import { PremiumCard } from "@/components/dashboard/premium-card";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { SkillRadar } from "@/components/dashboard/skill-radar";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-background to-muted/20">
      <DashboardNavbarWrapper />
      <div className="flex-1 space-y-7 p-6 md:p-8 pt-6 pb-20 md:pb-6 overflow-y-auto">
        <WelcomeBanner />
        <StatsCards />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-primary/60" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Activity Overview</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
              <AnalyticsChart />
            </div>
            <div className="lg:col-span-3">
              <LanguageChart />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-primary/60" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-5">
              <RecentConversations />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <PremiumCard />
              <SkillRadar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
