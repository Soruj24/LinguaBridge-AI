"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/components/socket-provider";
import axios from "axios";
import { formatLastSeen } from "@/lib/last-seen";

export interface UserStatusData {
  isOnline: boolean;
  lastSeen: string | null;
  showLastSeen: boolean;
}

export function useUserStatus(userId?: string) {
  const socket = useSocket();
  const [statuses, setStatuses] = useState<Map<string, UserStatusData>>(new Map());
  const fetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!socket) return;

    const handleStatusChange = (data: { userId: string; isOnline: boolean; lastSeen?: string; showLastSeen?: boolean }) => {
      setStatuses((prev) => {
        const next = new Map(prev);
        next.set(data.userId, {
          isOnline: data.isOnline,
          lastSeen: data.lastSeen || null,
          showLastSeen: data.showLastSeen ?? true,
        });
        return next;
      });
    };

    socket.on("user_status_change", handleStatusChange);
    socket.on("user_online", handleStatusChange);

    return () => {
      socket.off("user_status_change", handleStatusChange);
      socket.off("user_online", handleStatusChange);
    };
  }, [socket]);

  useEffect(() => {
    if (!userId || fetchedRef.current.has(userId)) return;
    const tid = userId;
    fetchedRef.current.add(tid);
    axios
      .get(`/api/user/status/${tid}`)
      .then((res) => {
        setStatuses((prev) => {
          const next = new Map(prev);
          next.set(tid, {
            isOnline: res.data.isOnline ?? false,
            lastSeen: res.data.lastSeen || null,
            showLastSeen: res.data.showLastSeen ?? true,
          });
          return next;
        });
      })
      .catch(() => {
        fetchedRef.current.delete(tid);
      });
  }, [userId]);

  function getStatus(uid: string): UserStatusData | undefined {
    return statuses.get(uid);
  }

  function isOnline(uid: string): boolean {
    return statuses.get(uid)?.isOnline ?? false;
  }

  function getLastSeenText(uid: string): string | null {
    const s = statuses.get(uid);
    if (!s) return null;
    return formatLastSeen(s.lastSeen, s.showLastSeen, s.isOnline);
  }

  const targetStatus = userId ? statuses.get(userId) : undefined;
  const targetLastSeenText = userId ? getLastSeenText(userId) : null;
  const targetIsOnline = userId ? isOnline(userId) : false;

  return {
    targetStatus,
    targetLastSeenText,
    targetIsOnline,
    statuses,
    getStatus,
    isOnline,
    getLastSeenText,
  };
}
