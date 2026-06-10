"use client";

import { useEffect } from "react";
import { useSidebar } from "@/hooks/use-sidebar";
import { BlockedUsersList } from "@/components/blocked-users-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/navigation";

export default function BlockedPage() {
  const { blockedUsers, handleUnblock, fetchData } = useSidebar();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
