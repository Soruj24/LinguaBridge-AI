"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Chat {
  _id: string;
  participants: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }[];
  lastMessage?: {
    originalText: string;
    createdAt: string;
  };
  updatedAt: string;
}

export function RecentConversations() {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await axios.get("/api/chat");
        // Sort by updatedAt desc just in case API doesn't
        const sorted = res.data.sort((a: Chat, b: Chat) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setChats(sorted.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch chats", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (session?.user) {
      fetchChats();
    }
  }, [session]);

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find((p) => p.email !== session?.user?.email);
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Recent Conversations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
            ))
          ) : (
            <>
          {chats.map((chat) => {
            const other = getOtherParticipant(chat);
            return (
              <Link 
                key={chat._id} 
                href={`/chat/${chat._id}`} 
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={other?.avatar} alt={other?.name} />
                  <AvatarFallback>{other?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium leading-none mb-1">{other?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {chat.lastMessage?.originalText || "No messages yet"}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(chat.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </Link>
            );
          })}
          {chats.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No conversations yet. Start chatting!
              </div>
          )}
          </>
        )}
        </div>
      </CardContent>
    </Card>
  );
}
