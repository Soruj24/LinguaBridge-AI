import type { UserItem, ActivityItem } from "@/components/features/admin/components";

export interface AdminStats {
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
}

export type TabType = "overview" | "users" | "chats" | "activity";
