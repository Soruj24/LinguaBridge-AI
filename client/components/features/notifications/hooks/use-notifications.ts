"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/navigation";
import api from "@/lib/api";
import { useServerUser } from "@/providers/server-user-provider";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const router = useRouter();
  const { isLoading: authLoading } = useServerUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/api/notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchNotifications();
  }, [authLoading]);

  const markAsRead = async (id?: string) => {
    try {
      const params = new URLSearchParams();
      if (id) params.set("id", id);
      else params.set("all", "true");

      await api.patch(`/api/notifications?${params.toString()}`);

      if (id) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    setIsOpen(false);
  };

  return {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    isLoading,
    markAsRead,
    handleNotificationClick,
  };
}
