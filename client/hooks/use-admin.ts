"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import type { UserItem, ChatItem } from "@/components/admin";
import type { AdminStats, TabType } from "@/types/admin";

export function useAdmin() {
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
    } catch {
      console.error("Failed to fetch stats");
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
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  const confirmAction = (title: string, action: () => void, isDangerous = false) => {
    setConfirmDialog({ open: true, title, action, isDangerous });
  };

  return {
    session, status,
    activeTab, setActiveTab,
    adminStats, statsLoading,
    users, loading,
    page, totalPages, setPage,
    search, setSearch,
    roleFilter, setRoleFilter,
    statusFilter, setStatusFilter,
    editUser, setEditUser,
    confirmDialog,
    chats,
    fetchStats, fetchUsers, fetchChats,
    updateUser, deleteChat, confirmAction,
  };
}
