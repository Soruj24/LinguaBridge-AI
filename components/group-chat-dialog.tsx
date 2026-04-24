"use client";

import { useState } from "react";
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
import { Search, Loader2, Users, Plus, X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

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
  const [users, setUsers] = useState<
    { _id: string; name: string; email: string; avatar: string }[]
  >([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const res = await axios.get(`/api/user/search?query=${query}`);
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      toast.error("Group name and at least one member required");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("groupName", groupName);
      formData.append("groupDescription", groupDescription);
      selectedUsers.forEach((id) => formData.append("participantIds", id));

      const res = await axios.post("/api/chat/group", formData);
      setOpen(false);
      if (onChatCreated) onChatCreated();
      router.push(`/chat/${res.data._id}`);
      router.refresh();
      toast.success("Group created!");
      
      setGroupName("");
      setGroupDescription("");
      setSelectedUsers([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" className="w-full justify-start gap-2 mb-2">
            <Users className="h-4 w-4" />
            {t("createGroup")}
          </Button>
        )}
      </DialogTrigger>
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

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t("addMembers")}</p>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-muted/50"
                />
              </form>
            </div>

            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {users.map((user) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selectedUsers.includes(user._id)
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/50 border border-transparent"
                    }`}
                    onClick={() => toggleUser(user._id)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 shadow-sm">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-muted">{user.name?.[0]}</AvatarFallback>
                      </Avatar>
                      {selectedUsers.includes(user._id) && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                          <X className="h-2 w-2 text-primary-foreground" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUser(id);
                        }}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}

            <Button
              onClick={createGroup}
              disabled={isLoading || !groupName.trim() || selectedUsers.length === 0}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
            >
              {isLoading ? (
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