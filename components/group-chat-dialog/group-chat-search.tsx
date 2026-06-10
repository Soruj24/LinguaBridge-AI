"use client";

import { Search, Loader2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface SearchUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface GroupChatSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
  users: SearchUser[];
  selectedUsers: string[];
  isSearching: boolean;
  onToggleUser: (userId: string) => void;
}

export function GroupChatSearch({
  query,
  onQueryChange,
  users,
  selectedUsers,
  isSearching,
  onToggleUser,
}: GroupChatSearchProps) {
  const t = useTranslations("GroupChat");

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        {t("addMembers")}{" "}
        <span className="text-[11px] text-muted-foreground/50">
          (friends only)
        </span>
      </p>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-muted/50"
        />
      </div>

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
            No friends match &ldquo;{query}&rdquo;
          </p>
        ) : (
          <div className="space-y-1">
            {users.map((user) => {
              const isSelected = selectedUsers.includes(user._id);
              return (
                <div
                  key={user._id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                    isSelected
                      ? "bg-primary/10 border-primary/30"
                      : "hover:bg-muted/50 border-transparent",
                  )}
                  onClick={() => onToggleUser(user._id)}
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
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
