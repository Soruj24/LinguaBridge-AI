"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, UserCheck, Loader2, X, Clock, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface SearchUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  friendStatus: "none" | "friends" | "request_sent" | "request_received";
}

interface AddFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}

export function AddFriendDialog({ open, onOpenChange, onAdded }: AddFriendDialogProps) {
  const t = useTranslations("Sidebar");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setUsers([]);
    }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get(`/api/friends/search?query=${encodeURIComponent(query)}`);
        setUsers(res.data.users ?? []);
      } catch {
        setUsers([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSendRequest = async (recipientId: string) => {
    setSendingIds((prev) => new Set(prev).add(recipientId));
    try {
      await axios.post("/api/friends/request", { recipientId });
      toast.success("Friend request sent");
      setUsers((prev) =>
        prev.map((u) =>
          u._id === recipientId ? { ...u, friendStatus: "request_sent" as const } : u,
        ),
      );
      onAdded();
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error) && error.response?.data?.error;
      toast.error(msg || "Failed to send request");
    } finally {
      setSendingIds((prev) => {
        const n = new Set(prev);
        n.delete(recipientId);
        return n;
      });
    }
  };

  const statusBadge = (user: SearchUser) => {
    switch (user.friendStatus) {
      case "friends":
        return (
          <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 font-medium shrink-0">
            <CheckCircle className="h-3 w-3" />
            Friends
          </span>
        );
      case "request_sent":
        return (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium shrink-0">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case "request_received":
        return (
          <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium shrink-0">
            <UserCheck className="h-3 w-3" />
            Received
          </span>
        );
      default:
        return (
          <Button
            size="sm"
            className="h-7 gap-1 rounded-lg text-xs shrink-0 px-2.5"
            onClick={(e) => {
              e.stopPropagation();
              handleSendRequest(user._id);
            }}
            disabled={sendingIds.has(user._id)}
          >
            {sendingIds.has(user._id) ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <UserPlus className="h-3 w-3" />
            )}
            Add
          </Button>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Friends</DialogTitle>
          <DialogDescription>
            Search for people by name or email and send them a friend request.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Search people..."
            className="pl-10 h-10 bg-muted/40 border-border/30 focus:border-primary/40 rounded-xl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query.length > 0 && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[300px] -mx-6 px-6">
          {query.length < 2 ? (
            <p className="text-center text-sm text-muted-foreground/60 py-8">
              Type at least 2 characters to search
            </p>
          ) : isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground/60 py-8">
              No people found matching "{query}"
            </p>
          ) : (
            <div className="space-y-1 py-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                    user.friendStatus === "none" && "hover:bg-muted/50",
                  )}
                >
                  <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground/70 truncate">{user.email}</p>
                  </div>
                  {statusBadge(user)}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
