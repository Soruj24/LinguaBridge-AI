"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Shield, Users, UserCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AdminStatCard,
  AdminStatCardSkeleton,
  AdminAreaChart,
  AdminPieChart,
  AdminUserTable,
  AdminChatList,
  AdminActivityLog,
  AdminActivityListCompact,
} from "@/components/admin";
import type { UserItem, ChatItem, ActivityItem } from "@/components/admin";

type AdminStats = {
  stats: {
    users: { total: number; active: number; admins: number; newLast7Days: number; newLast30Days: number };
    chats: { total: number; activeLast7Days: number };
    messages: { total: number; last7Days: number };
  };
  recentUsers: UserItem[];
  activeUsersList: { _id: string; name: string; email: string; lastLogin?: string }[];
  languageStats: { _id: string; count: number }[];
  recentActivity: ActivityItem[];
  chartData: {
    users: { _id: string; count: number }[];
    messages: { _id: string; count: number }[];
    chats: { _id: string; count: number }[];
  };
};

type TabType = "overview" | "users" | "chats" | "activity";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    action: () => void;
    isDangerous?: boolean;
  }>({ open: false, title: "", action: () => {} });

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok) setAdminStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "15");
      if (search) params.set("q", search);
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "all") params.set("isActive", statusFilter === "active" ? "true" : "false");
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setUsers([]);
        setTotalPages(1);
        return;
      }
      setUsers(data.data || []);
      setTotalPages(data.meta?.pages || 1);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/chat?paginate=true&page=1&limit=50&sortBy=updatedAt");
      const data = await res.json();
      setChats(data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push(`/${locale}/login`);
      return;
    }
    if ((session.user as { role?: string })?.role !== "admin") {
      router.push(`/${locale}/dashboard`);
      return;
    }
    fetchStats();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "chats") fetchChats();
  }, [status, session, router, activeTab, fetchStats, fetchUsers, fetchChats, locale]);

  const updateUser = async (payload: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      setEditUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await fetch(`/api/chat/${chatId}`, { method: "DELETE" });
      fetchChats();
      toast.success("Chat deleted");
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  };

  const confirmAction = (title: string, action: () => void, isDangerous = false) => {
    setConfirmDialog({ open: true, title, action, isDangerous });
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "chats", label: "Chats" },
    { key: "activity", label: "Activity" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminStats?.stats ? (
                <>
                  <AdminStatCard
                    title="Total Users"
                    value={adminStats.stats.users.total}
                    change={adminStats.stats.users.newLast7Days}
                    changeLabel="this week"
                    icon={Users}
                    color="from-blue-600 to-blue-700"
                  />
                  <AdminStatCard
                    title="Active Users"
                    value={adminStats.stats.users.active}
                    icon={UserCheck}
                    color="from-green-600 to-green-700"
                  />
                  <AdminStatCard
                    title="Total Chats"
                    value={adminStats.stats.chats.total}
                    change={adminStats.stats.chats.activeLast7Days}
                    changeLabel="active"
                    icon={MessageSquare}
                    color="from-purple-600 to-purple-700"
                  />
                  <AdminStatCard
                    title="Messages"
                    value={adminStats.stats.messages.total}
                    change={adminStats.stats.messages.last7Days}
                    changeLabel="this week"
                    icon={Activity}
                    color="from-orange-600 to-orange-700"
                  />
                </>
              ) : (
                Array(4).fill(0).map((_, i) => (
                  <AdminStatCardSkeleton key={i} />
                ))
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminAreaChart
                data={adminStats?.chartData?.users || []}
                title="User Growth (30 Days)"
                color="blue"
              />
              <AdminAreaChart
                data={adminStats?.chartData?.messages || []}
                title="Message Activity"
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminPieChart data={adminStats?.languageStats || []} title="Language Distribution" />
              <div className="bg-card rounded-2xl border p-6">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <AdminActivityListCompact activities={adminStats?.recentActivity || []} />
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <AdminUserTable
            users={users}
            loading={loading}
            page={page}
            totalPages={totalPages}
            search={search}
            roleFilter={roleFilter}
            statusFilter={statusFilter}
            onSearchChange={setSearch}
            onRoleFilterChange={setRoleFilter}
            onStatusFilterChange={setStatusFilter}
            onPageChange={setPage}
            onEditUser={setEditUser}
            onUpdateUser={updateUser}
            onRefresh={fetchUsers}
          />
        );

      case "chats":
        return <AdminChatList chats={chats} loading={loading} onDeleteChat={deleteChat} onRefresh={fetchChats} />;

      case "activity":
        return (
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-semibold mb-4">Login Activity Log</h3>
            <AdminActivityLog activities={adminStats?.recentActivity || []} />
          </div>
        );
    }
  };

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
          <Button variant="outline" onClick={fetchStats}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <nav className="flex gap-1 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.key
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
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}