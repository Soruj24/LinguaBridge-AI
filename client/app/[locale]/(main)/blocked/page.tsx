"use client";

import { useEffect, useState } from "react";
import { BlockedUsersList } from "@/components/ui/blocked-users-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/navigation";
import api from "@/lib/api";

export default function BlockedPage() {
  const [blockedUsers, setBlockedUsers] = useState<{ _id: string; blocked: { _id: string; name: string; avatar?: string }; createdAt: string }[]>([]);

  useEffect(() => {
    api.get("/api/friends/blocked-users")
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : data.blockedUsers || [];
        setBlockedUsers(items.map((item: Record<string, unknown>) => {
          const blocked = (item.blocked || item) as { _id: string; name: string; avatar?: string };
          return {
            _id: (item._id as string) || blocked._id,
            blocked,
            createdAt: (item.createdAt as string) || new Date().toISOString(),
          };
        }));
      })
      .catch(() => {});
  }, []);

  const handleUnblock = async (userId: string) => {
    await api.delete(`/api/friends/block/${userId}`);
    setBlockedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Blocked Users</h1>
      </div>
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <BlockedUsersList
          blockedUsers={blockedUsers}
          onUnblock={handleUnblock}
        />
      </div>
    </div>
  );
}
