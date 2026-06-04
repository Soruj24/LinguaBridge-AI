"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, Shield, Users, UserCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdminStatCard, AdminStatCardSkeleton, AdminAreaChart, AdminPieChart,
  AdminUserTable, AdminChatList, AdminActivityLog, AdminActivityListCompact,
} from "@/components/admin";
import { useAdmin } from "@/hooks/use-admin";

const tabs = [
  { key: "overview" as const, label: "Overview" },
  { key: "users" as const, label: "Users" },
  { key: "chats" as const, label: "Chats" },
  { key: "activity" as const, label: "Activity" },
];

export default function AdminPage() {
  const a = useAdmin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-slate-100">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your platform</p>
            </div>
          </div>
          <Button variant="outline" onClick={a.fetchStats}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <nav className="flex gap-1 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => a.setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                a.activeTab === tab.key
                  ? "bg-primary/10 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="p-6 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={a.activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {a.activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {a.adminStats?.stats ? (
                    <>
                      <AdminStatCard title="Total Users" value={a.adminStats.stats.users.total} change={a.adminStats.stats.users.newLast7Days} changeLabel="this week" icon={Users} color="from-blue-600 to-blue-700" />
                      <AdminStatCard title="Active Users" value={a.adminStats.stats.users.active} icon={UserCheck} color="from-green-600 to-green-700" />
                      <AdminStatCard title="Total Chats" value={a.adminStats.stats.chats.total} change={a.adminStats.stats.chats.activeLast7Days} changeLabel="active" icon={MessageSquare} color="from-purple-600 to-purple-700" />
                      <AdminStatCard title="Messages" value={a.adminStats.stats.messages.total} change={a.adminStats.stats.messages.last7Days} changeLabel="this week" icon={Activity} color="from-orange-600 to-orange-700" />
                    </>
                  ) : (
                    Array(4).fill(0).map((_, i) => <AdminStatCardSkeleton key={i} />)
                  )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AdminAreaChart data={a.adminStats?.chartData?.users || []} title="User Growth (30 Days)" color="blue" />
                  <AdminAreaChart data={a.adminStats?.chartData?.messages || []} title="Message Activity" color="green" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AdminPieChart data={a.adminStats?.languageStats || []} title="Language Distribution" />
                  <div className="bg-card rounded-2xl border p-6">
                    <h3 className="font-semibold mb-4">Recent Activity</h3>
                    <AdminActivityListCompact activities={a.adminStats?.recentActivity || []} />
                  </div>
                </div>
              </div>
            )}
            {a.activeTab === "users" && (
              <AdminUserTable
                users={a.users} loading={a.loading} page={a.page} totalPages={a.totalPages}
                search={a.search} roleFilter={a.roleFilter} statusFilter={a.statusFilter}
                onSearchChange={a.setSearch} onRoleFilterChange={a.setRoleFilter}
                onStatusFilterChange={a.setStatusFilter} onPageChange={a.setPage}
                onEditUser={a.setEditUser} onUpdateUser={a.updateUser} onRefresh={a.fetchUsers}
              />
            )}
            {a.activeTab === "chats" && (
              <AdminChatList chats={a.chats} loading={a.loading} onDeleteChat={a.deleteChat} onRefresh={a.fetchChats} />
            )}
            {a.activeTab === "activity" && (
              <div className="bg-card rounded-2xl border p-6">
                <h3 className="font-semibold mb-4">Login Activity Log</h3>
                <AdminActivityLog activities={a.adminStats?.recentActivity || []} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
