"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, Plus, MessageSquare, Settings, Search } from "lucide-react";
import { useSocket } from "@/components/socket-provider";
import { NewChatDialog } from "@/components/new-chat-dialog";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  updatedAt: string;
}

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const socket = useSocket();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchChats = useCallback(async () => {
    try {
      const res = await axios.get("/api/chat");
      setChats(res.data);
    } catch (error) {
      console.error("Failed to fetch chats", error);
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
    return message.originalText || "Voice Message";
  };

  const filteredChats = chats.filter((chat) => {
    const other = getOtherParticipant(chat);
    return other?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-screen w-80 border-r bg-background/95 backdrop-blur-xl shadow-lg z-50">
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
            placeholder="Search chats..."
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {filteredChats.map((chat) => {
            const other = getOtherParticipant(chat);
            if (!other) return null;
            const isActive = pathname === `/chat/${chat._id}`;

            return (
              <Link
                key={chat._id}
                href={`/chat/${chat._id}`}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-[1.02]",
                  isActive ? "bg-primary/10 shadow-sm border-l-4 border-primary pl-2" : "hover:bg-muted/50"
                )}
              >
                <Avatar className="mt-1">
                  <AvatarImage src={other.avatar || undefined} />
                  <AvatarFallback>{other.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p
                      className={`font-medium truncate ${isActive ? "text-primary" : ""}`}
                    >
                      {other.name}
                    </p>
                    {chat.lastMessage && (
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(
                          chat.lastMessage.createdAt,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage ? (
                      getLastMessageText(chat.lastMessage)
                    ) : (
                      <span className="italic opacity-70">
                        Start a conversation
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            );
          })}
          {filteredChats.length === 0 && (
            <div className="text-center text-muted-foreground p-4 text-sm">
              No chats found
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
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2"
            onClick={() => router.push("/settings")}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
