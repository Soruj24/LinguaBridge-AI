"use client";

import { useEffect, useState, useCallback } from "react";
import { Link, usePathname, useRouter } from "@/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "@/components/mode-toggle";
import { LogOut, Plus, MessageSquare, Settings, Search, Globe, Circle } from "lucide-react";
import { useSocket } from "@/components/socket-provider";
import { NewChatDialog } from "@/components/new-chat-dialog";
import { LanguageModal } from "@/components/language-modal";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Chat {
  _id: string;
  participants: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    preferredLanguage: string;
  }[];
  lastMessage?: {
    originalText: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount?: number;
  updatedAt: string;
}

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const t = useTranslations('Sidebar');
  const tAuth = useTranslations('Auth');
  const tChat = useTranslations('Chat');
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const socket = useSocket();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const fetchChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/chat");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setChats(data);
    } catch (error) {
      console.error("Failed to fetch chats", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const userEmail = session?.user?.email;

  useEffect(() => {
    if (userEmail) {
      fetchChats();
    }
  }, [userEmail, fetchChats]);

  useEffect(() => {
    if (!socket) return;

    socket.on("new_message", (message: Chat["lastMessage"]) => {
      fetchChats();
    });

    return () => {
      socket.off("new_message");
    };
  }, [socket, fetchChats]);

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find((p) => p.email !== session?.user?.email);
  };

  const getLastMessageText = (message: Chat["lastMessage"]) => {
    if (!message) return "";
    return message.originalText || tChat('voiceMessage');
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString(session?.user?.preferredLanguage || [], { month: 'short', day: 'numeric' });
  };

  const filteredChats = chats.filter((chat) => {
    const other = getOtherParticipant(chat);
    return other?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className={cn("flex flex-col h-screen w-80 border-r bg-background/95 backdrop-blur-xl shadow-lg z-50", className)}>
      <div className="p-4 border-b space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-xl flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            LinguaBridge
          </h1>
          <NewChatDialog onChatCreated={fetchChats}>
            <Button size="icon" className="rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all hover:scale-105">
              <Plus className="h-5 w-5" />
            </Button>
          </NewChatDialog>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-3 w-[180px]" />
                </div>
              </div>
            ))
          ) : filteredChats.map((chat) => {
            const other = getOtherParticipant(chat);
            if (!other) return null;
            const isActive = pathname === `/chat/${chat._id}`;

return (
              <Link
                key={chat._id}
                href={`/chat/${chat._id}`}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-muted/70 active:scale-[0.98]",
                  isActive ? "bg-primary/10 shadow-sm border-l-4 border-primary pl-2" : "hover:bg-muted/50"
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-transparent">
                    <AvatarImage src={other.avatar || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {other.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {(chat as Chat & { online?: boolean }).online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden min-w-0">
                  <div className="flex justify-between items-center">
                    <p
                      className={cn(
                        "font-semibold truncate",
                        isActive ? "text-primary" : "",
                        ((chat as Chat & { unreadCount?: number }).unreadCount ?? 0) > 0 ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {other.name}
                    </p>
                    {chat.lastMessage && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 font-medium">
                        {formatTimestamp(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {((chat as Chat & { unreadCount?: number }).unreadCount ?? 0) > 0 ? (
                      <span className="flex-1 text-sm font-medium text-foreground truncate">
                        {getLastMessageText(chat.lastMessage)}
                      </span>
                    ) : (
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage ? (
                          getLastMessageText(chat.lastMessage)
                        ) : (
                          <span className="italic opacity-70">
                            {t('startConversation')}
                          </span>
                        )}
                      </p>
                    )}
                    {((chat as Chat & { unreadCount?: number }).unreadCount ?? 0) > 0 && (
                      <span className="shrink-0 min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {(chat as Chat & { unreadCount?: number }).unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
          }
          {!isLoading && filteredChats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground mb-1">
                {searchQuery ? t('noResults') : t('noChats')}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery 
                  ? `"${searchQuery}"` 
                  : t('noChatsDesc')}
              </p>
              {!searchQuery && (
                <NewChatDialog onChatCreated={fetchChats}>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t('startNewChat')}
                  </Button>
                </NewChatDialog>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t mt-auto bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="font-medium truncate">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start gap-2 mb-2 bg-background/50"
          onClick={() => setShowLanguageModal(true)}
        >
          <Globe className="h-4 w-4" />
          {t('languageRegion')}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2"
            onClick={() => router.push("/settings")}
          >
            <Settings className="h-4 w-4" />
            {t('settings')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            {tAuth('logout')}
          </Button>
        </div>
      </div>
      
      <LanguageModal open={showLanguageModal} onOpenChange={setShowLanguageModal} />
    </div>
  );
}
