import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Languages, Mic } from "lucide-react";

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2,350</div>
          <p className="text-xs text-muted-foreground">+180 from last week</p>
        </CardContent>
      </Card>
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Translations Done</CardTitle>
          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <Languages className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,420</div>
          <p className="text-xs text-muted-foreground">+12% increase</p>
        </CardContent>
      </Card>
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-rose-500 bg-gradient-to-br from-white to-rose-50 dark:from-slate-800 dark:to-slate-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Voice Translations</CardTitle>
          <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
            <Mic className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">342</div>
          <p className="text-xs text-muted-foreground">+24 this week</p>
        </CardContent>
      </Card>
    </div>
  );
}
