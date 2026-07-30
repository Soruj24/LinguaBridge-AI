"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, UserX, Loader2, Inbox } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/utils";
import { useServerUser } from "@/providers/server-user-provider";

interface PendingRequest {
  _id: string;
  user: { _id: string; name: string; email: string; avatar?: string };
  createdAt: string;
}

export function FriendRequestsCard() {
  const { isLoading: authLoading } = useServerUser();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());
  const [rejectingIds, setRejectingIds] = useState<Set<string>>(new Set());

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/api/friends/requests");
      setRequests(res.data.incoming ?? []);
    } catch {
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchRequests();
  }, [authLoading]);

  const handleAccept = async (id: string) => {
    setAcceptingIds((p) => new Set(p).add(id));
    try {
      await api.patch(`/api/friends/${id}`, { action: "accept" });
      toast.success("Friend request accepted");
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast.error("Failed to accept");
    } finally {
      setAcceptingIds((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  const handleReject = async (id: string) => {
    setRejectingIds((p) => new Set(p).add(id));
    try {
      await api.patch(`/api/friends/${id}`, { action: "reject" });
      toast.success("Request declined");
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast.error("Failed to decline");
    } finally {
      setRejectingIds((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  if (isLoading) return null;
  if (requests.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/60 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <UserPlus className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Friend Requests</h3>
            <p className="text-[11px] text-muted-foreground">{requests.length} pending</p>
          </div>
        </div>
        <span className="min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-600 dark:text-amber-400">
          {requests.length}
        </span>
      </div>

      <div className="space-y-2">
        {requests.map((req) => (
          <div
            key={req._id}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 border border-border/30"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={req.user.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {req.user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{req.user.name}</p>
              <p className="text-[11px] text-muted-foreground/70">Wants to connect</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                className="h-7 w-7 rounded-lg p-0 bg-primary hover:bg-primary/90"
                onClick={() => handleAccept(req._id)}
                disabled={acceptingIds.has(req._id)}
              >
                {acceptingIds.has(req._id) ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 rounded-lg p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleReject(req._id)}
                disabled={rejectingIds.has(req._id)}
              >
                {rejectingIds.has(req._id) ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserX className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
