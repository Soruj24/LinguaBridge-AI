"use client";

import { useState, useEffect } from "react";
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
import { Users, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { GroupChatSearch } from "./group-chat-dialog/group-chat-search";
import { GroupChatSelected } from "./group-chat-dialog/group-chat-selected";
import { useGroupChat } from "./group-chat-dialog/use-group-chat";

export function GroupChatDialog({
  children,
  onChatCreated,
}: {
  children?: React.ReactNode;
  onChatCreated?: () => void;
}) {
  const t = useTranslations("GroupChat");
  const [open, setOpen] = useState(false);
  const {
    query,
    setQuery,
    users,
    selectedUsers,
    groupName,
    setGroupName,
    groupDescription,
    setGroupDescription,
    isSearching,
    isCreating,
    toggleUser,
    createGroup,
    resetState,
  } = useGroupChat(onChatCreated);

  useEffect(() => {
    if (!open) resetState();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0">
        <div>
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

            <GroupChatSearch
              query={query}
              onQueryChange={setQuery}
              users={users}
              selectedUsers={selectedUsers}
              isSearching={isSearching}
              onToggleUser={toggleUser}
            />

            <GroupChatSelected
              userIds={selectedUsers}
              users={users}
              onRemove={toggleUser}
            />

            <Button
              onClick={createGroup}
              disabled={
                isCreating || !groupName.trim() || selectedUsers.length === 0
              }
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
