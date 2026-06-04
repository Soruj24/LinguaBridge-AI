"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, Users, X, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SearchUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  friendStatus: string;
}

export function GroupChatDialog({
  children,
  onChatCreated,
}: {
  children?: React.ReactNode;
  onChatCreated?: () => void;
}) {
  const t = useTranslations("GroupChat");
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setUsers([]);
      setSelectedUsers([]);
      setGroupName("");
      setGroupDescription("");
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
        setUsers((res.data.users ?? []).filter((u: SearchUser) => u.friendStatus === "friends"));
      } catch {
        setUsers([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("groupName", groupName);
      formData.append("groupDescription", groupDescription);
      selectedUsers.forEach((id) => formData.append("participantIds", id));

      const res = await axios.post("/api/chat/group", formData);
      setOpen(false);
      onChatCreated?.();
      router.push(`/chat/${res.data._id}`);
      router.refresh();
      toast.success("Group created!");
    } catch {
      toast.error("Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              {t("createGroup")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 px-6 pb-6">
            {/* Group name & description */}
            <div className="space-y-3">
              <Input
                placeholder={t("groupNamePlaceholder")}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="h-11 rounded-xl bg-muted/50"
              />
              <Textarea
                placeholder={t("groupDescriptionPlaceholder")}
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="min-h-[80px] rounded-xl bg-muted/50 resize-none"
              />
            </div>

            {/* Search friends */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {t("addMembers")} <span className="text-[11px] text-muted-foreground/50">(friends only)</span>
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-muted/50"
                />
              </div>
            </div>

            {/* Selected chips */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-xl">
                {selectedUsers.map((id) => {
                  const user = users.find((u) => u._id === id);
                  return user ? (
                    <span
                      key={id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full text-xs font-medium"
                    >
                      {user.name}
                      <button onClick={() => toggleUser(id)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}

            {/* Search results */}
            <ScrollArea className="h-[200px] pr-4">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : query.length < 2 ? (
                <p className="text-center text-sm text-muted-foreground/60 py-8">
                  Type at least 2 characters
                </p>
              ) : users.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground/60 py-8">
                  No friends match "{query}"
                </p>
              ) : (
                <div className="space-y-1">
                  {users.map((user) => {
                    const isSelected = selectedUsers.includes(user._id);
                    return (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                          isSelected
                            ? "bg-primary/10 border-primary/30"
                            : "hover:bg-muted/50 border-transparent",
                        )}
                        onClick={() => toggleUser(user._id)}
                      >
                        <Avatar className="h-10 w-10 shadow-sm shrink-0">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-muted">
                            {user.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        {isSelected ? (
                          <span className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <CheckCircle className="h-3.5 w-3.5 text-primary-foreground" />
                          </span>
                        ) : (
                          <span className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            <Button
              onClick={createGroup}
              disabled={isCreating || !groupName.trim() || selectedUsers.length === 0}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
            >
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Users className="mr-2 h-4 w-4" />
              )}
              {t("createButton")}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
