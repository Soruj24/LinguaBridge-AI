"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import api from "@/lib/api";
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
      const { data } = await api.get("/api/admin/stats");
      setAdminStats(data);
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
      const { data } = await api.get(`/api/admin/users?${params.toString()}`);
      setUsers(data.data || []);
      setTotalPages(data.meta?.pages || 1);
    } catch {
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/chat?paginate=true&page=1&limit=50&sortBy=updatedAt");
      setChats(data.data || []);
    } catch {
      setChats([]);
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
      const { data } = await api.put("/api/admin/users", payload);
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
      await api.delete(`/api/chat/${chatId}`);
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
