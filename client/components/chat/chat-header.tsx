"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  MoreVertical,
  Search,
  Phone,
  Video,
  Globe,
  Users,
  Info,
  Settings,
  UserPlus,
} from "lucide-react";

interface ChatParticipant {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  preferredLanguage: string;
}

interface ChatHeaderProps {
  participant?: ChatParticipant;
  isGroup?: boolean;
  groupName?: string;
  groupParticipants?: ChatParticipant[];
  onBack?: () => void;
  onAddMember?: () => void;
  onViewInfo?: () => void;
  onSettings?: () => void;
  online?: boolean;
  className?: string;
}

export function ChatHeader({
  participant,
  isGroup = false,
  groupName,
  groupParticipants = [],
  onBack,
  onAddMember,
  onViewInfo,
  onSettings,
  online,
  className,
}: ChatHeaderProps) {
  const router = useRouter();
  const displayName = isGroup ? groupName : participant?.name;
  const displayAvatar = isGroup ? null : participant?.avatar;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Avatar className="h-10 w-10">
          <AvatarImage src={displayAvatar || undefined} />
          <AvatarFallback>
            {displayName?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate">{displayName}</p>
            {!isGroup && online && (
              <span className="h-2 w-2 rounded-full bg-green-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {isGroup
              ? `${groupParticipants.length} members`
              : online
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewInfo}>
              <Info className="h-4 w-4 mr-2" />
              View info
            </DropdownMenuItem>
            {isGroup && (
              <DropdownMenuItem onClick={onAddMember}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add member
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}