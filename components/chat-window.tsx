"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "./socket-provider";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Send,
  Volume2,
  Globe,
  Sparkles,
  FileText,
  Wand2,
  Phone,
  Video,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MessageBubble } from "@/components/message-bubble";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VoiceRecorder } from "@/components/voice-recorder";
import { AnimatePresence, motion } from "framer-motion";
import { TypingIndicator } from "@/components/typing-indicator";

interface Message {
  _id: string;
  chatId: string;
  senderId: { _id: string; name: string; email: string; avatar?: string };
  receiverId?: { _id: string; name: string; email: string; avatar?: string };
  originalText: string;
  translatedText?: string;
  voiceUrl?: string;
  translatedVoiceUrl?: string;
  createdAt: string;
}

interface Chat {
  _id: string;
  participants: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    preferredLanguage: string;
  }[];
}

export function ChatWindow({ chatId }: { chatId: string }) {
  const { data: session } = useSession();
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMessages();
    fetchSuggestions();
  }, [chatId]);

  useEffect(() => {
    if (socket) {
      socket.emit("join_chat", chatId);

      socket.on("receive_message", (message: Message) => {
        if (message.chatId === chatId) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === message._id)) return prev;
            return [...prev, message];
          });
          scrollToBottom();
          setIsTyping(false); // Stop typing indicator when message received

          // Fetch new suggestions when receiving a message from other
          if (message.senderId._id !== getSenderId()) {
            fetchSuggestions();
          }
        }
      });

      socket.on("typing", ({ chatId: eventChatId, userId }) => {
        if (eventChatId === chatId) {
          const myEmail = session?.user?.email;
          const sender = chat?.participants.find((p) => p._id === userId);

          if (sender && sender.email !== myEmail) {
            setTypingUser(sender.name);
            setIsTyping(true);

            if (typingTimeoutRef.current)
              clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
              setTypingUser(null);
            }, 3000);
          }
        }
      });

      socket.on("message_deleted", ({ messageId }) => {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      });

      return () => {
        socket.off("receive_message");
        socket.off("typing");
        socket.off("message_deleted");
      };
    }
  }, [chatId, socket, chat, session]);

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await axios.delete(`/api/chat/message/${messageId}`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      socket?.emit("delete_message", { chatId, messageId });
      toast.success("Message deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (socket && session?.user) {
      // We need the user ID.
      // Let's look at getReceiverId. It uses session.user.email to find the OTHER participant.
      // We need OUR id.
      const myId = chat?.participants.find(
        (p) => p.email === session.user?.email,
      )?._id;
      if (myId) {
        socket.emit("typing", { chatId, userId: myId });
      }
    }
  };

  const fetchMessages = async (before?: string) => {
    try {
      if (before) setIsLoadingMore(true);

      const url =
        `/api/chat/${chatId}?limit=20` + (before ? `&before=${before}` : "");
      const res = await axios.get(url);

      if (before) {
        setMessages((prev) => [...res.data.messages, ...prev]);
      } else {
        setMessages(res.data.messages);
        setChat(res.data.chat);
        scrollToBottom();
      }
      setHasMore(res.data.hasMore);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load chat");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      setIsLoadingSuggestions(true);
      const res = await axios.post(`/api/chat/${chatId}/suggestions`);
      if (res.data.suggestions) {
        setSuggestions(res.data.suggestions);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSummarize = async () => {
    try {
      setIsSummarizing(true);
      setIsSummaryOpen(true);
      const res = await axios.post(`/api/chat/${chatId}/summary`);
      if (res.data.summary) {
        setSummary(res.data.summary);
      }
    } catch (error) {
      toast.error("Failed to summarize chat");
    } finally {
      setIsSummarizing(false);
    }
  };

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (
      target.scrollTop === 0 &&
      hasMore &&
      !isLoadingMore &&
      messages.length > 0
    ) {
      const firstMessage = messages[0];
      const oldHeight = target.scrollHeight;

      fetchMessages(firstMessage.createdAt).then(() => {
        // Restore scroll position
        requestAnimationFrame(() => {
          target.scrollTop = target.scrollHeight - oldHeight;
        });
      });
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const getReceiverId = () => {
    const userEmail = session?.user?.email;
    if (!chat || !userEmail) return null;
    const other = chat.participants.find((p) => p.email !== userEmail);
    return other?._id;
  };

  const getSenderId = () => {
    const userEmail = session?.user?.email;
    if (!chat || !userEmail) return null;
    const me = chat.participants.find((p) => p.email === userEmail);
    return me?._id;
  };

  const handleSuggestionClick = (text: string) => {
    setNewMessage(text);
  };

  const handleRewrite = async (tone: string) => {
    if (!newMessage.trim()) return;

    try {
      setIsRewriting(true);
      const res = await axios.post("/api/chat/rewrite", {
        text: newMessage,
        tone,
      });
      if (res.data.rewritten) {
        setNewMessage(res.data.rewritten);
        toast.success(`Rewritten as ${tone}`);
      }
    } catch (error) {
      toast.error("Failed to rewrite text");
    } finally {
      setIsRewriting(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const receiverId = getReceiverId();
    const senderId = getSenderId();

    if (!receiverId || !senderId) return;

    if (socket) {
      socket.emit(
        "send_message",
        {
          chatId,
          receiverId,
          senderId,
          text: newMessage,
        },
        (response: { status: string }) => {
          if (response?.status !== "ok") {
            toast.error("Failed to send message");
            setNewMessage(newMessage); // Restore text
          }
        },
      );

      // Optimistically add message
      const tempMessage: Message = {
        _id: Date.now().toString(),
        chatId,
        senderId: {
          _id: senderId,
          name: session?.user?.name || "Me",
          email: session?.user?.email || "",
          avatar: session?.user?.image || undefined,
        },
        originalText: newMessage,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");
      setSuggestions([]); // Clear suggestions after sending
      scrollToBottom();
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    try {
      const receiverId = getReceiverId();
      if (!receiverId) return;

      const formData = new FormData();
      formData.append("file", audioBlob, "voice.webm");
      formData.append("chatId", chatId);
      formData.append("receiverId", receiverId);

      const res = await axios.post("/api/chat/voice", formData);

      socket?.emit("send_message", res.data);
      setMessages((prev) => [...prev, res.data]);
      scrollToBottom();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send voice message");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="p-4 border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 flex justify-between items-center shadow-sm z-50">
        <div className="flex items-center gap-3">
          {chat?.participants
            .filter((p) => p.email !== session?.user?.email)
            .map((p) => (
              <div key={p._id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarImage src={p.avatar} />
                  <AvatarFallback>{p.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-sm">{p.name}</h2>
                  <p className="text-xs text-muted-foreground capitalize">
                    {p.preferredLanguage === "en"
                      ? "English"
                      : p.preferredLanguage}{" "}
                    Speaker
                  </p>
                </div>
              </div>
            ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Video className="h-5 w-5" />
          </Button>
          <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSummarize}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Summarize
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Conversation Summary</DialogTitle>
              </DialogHeader>
              <div className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">
                {isSummarizing ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Sparkles className="h-5 w-5 animate-spin mr-2" />
                    Generating summary...
                  </div>
                ) : (
                  summary || "No summary available."
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4" onScroll={onScroll}>
        <div className="space-y-6 pb-4">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                isMe={msg.senderId._id === session?.user?.id}
                onDelete={handleDeleteMessage}
              />
            ))}
          </AnimatePresence>
          {isTyping && typingUser && (
            <div className="flex items-center gap-2 ml-4">
               <Avatar className="h-8 w-8">
                  <AvatarFallback>{typingUser[0]}</AvatarFallback>
               </Avatar>
               <TypingIndicator />
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 py-3 bg-background border-t flex gap-2 overflow-x-auto">
          {suggestions.map((suggestion, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="rounded-full bg-card hover:bg-accent text-card-foreground border-primary/20 hover:border-primary transition-all h-auto py-1.5 px-4 text-sm font-normal shrink-0 shadow-sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
              {suggestion}
            </Button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t flex items-center gap-2 bg-background/80 backdrop-blur-md sticky bottom-0 z-50 shadow-lg">
        <Input
          className="bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-full px-4 h-11 transition-all"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted"
              disabled={!newMessage.trim() || isRewriting}
              title="Rewrite Message"
            >
              <Wand2
                className={`h-5 w-5 ${isRewriting ? "animate-spin" : ""}`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleRewrite("Formal")}>
              👔 Formal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRewrite("Casual")}>
              😎 Casual
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRewrite("Professional")}>
              💼 Professional
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRewrite("Friendly")}>
              😊 Friendly
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRewrite("Concise")}>
              ✂️ Concise
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <VoiceRecorder onSend={sendVoiceMessage} />
        <Button
          size="icon"
          onClick={sendMessage}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
