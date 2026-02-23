"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "./socket-provider";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TextareaAutosize from "react-textarea-autosize";
import { Send, Sparkles, Wand2, Phone, Video, ArrowLeft } from "lucide-react";
import { useRouter } from "@/navigation";
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
import { AnimatePresence } from "framer-motion";
import { TypingIndicator } from "@/components/typing-indicator";
import { TrustBanner } from "@/components/trust-banner";
import { useTranslations } from "next-intl";

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
  isOptimistic?: boolean;
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
  const t = useTranslations("Chat");
  const { data: session } = useSession();
  const router = useRouter();
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isRestoringScroll, setIsRestoringScroll] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsLoading(true);
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

            // Check if we have an optimistic message that matches this real message
            const optimisticMatchIndex = prev.findIndex(
              (m) =>
                m.isOptimistic &&
                m.originalText === message.originalText &&
                m.senderId._id === message.senderId._id,
            );

            if (optimisticMatchIndex !== -1) {
              const newMessages = [...prev];
              newMessages[optimisticMatchIndex] = message;
              return newMessages;
            }

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setNewMessage(e.target.value);

    // Typing indicator logic
    if (socket && session?.user && chat) {
      const me = chat.participants.find((p) => p.email === session.user?.email);
      if (me) {
        socket.emit("typing", { chatId, userId: me._id });
      }
    }
  };

  const fetchMessages = async (before?: string) => {
    try {
      if (before) {
        setIsLoadingMore(true);
        if (viewportRef.current) {
          prevScrollHeightRef.current = viewportRef.current.scrollHeight;
          setIsRestoringScroll(true);
        }
      }

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
      if (!before) {
        setIsLoadingMore(false);
        setIsLoading(false);
      }
      // If 'before' is true, isLoadingMore is handled in useLayoutEffect
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

  useLayoutEffect(() => {
    if (isRestoringScroll && viewportRef.current) {
      const newScrollHeight = viewportRef.current.scrollHeight;
      const diff = newScrollHeight - prevScrollHeightRef.current;
      if (diff > 0) {
        viewportRef.current.scrollTop = diff;
      }
      setIsRestoringScroll(false);
      setIsLoadingMore(false);
    }
  }, [messages, isRestoringScroll]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;

    if (
      target.scrollTop === 0 &&
      hasMore &&
      !isLoadingMore &&
      messages.length > 0
    ) {
      const firstMessage = messages[0];
      fetchMessages(firstMessage.createdAt);
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
        toast.success(t("rewrittenAs", { tone }));
      }
    } catch (error) {
      toast.error(t("rewriteFailed"));
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
            toast.error(t("sendFailed"));
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
        isOptimistic: true,
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
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-950 relative">
      {/* Header - Fixed/Absolute on top */}
      <div className="absolute top-0 left-0 right-0 p-3 md:p-4 pt-[calc(0.75rem+env(safe-area-inset-top))] md:pt-[calc(1rem+env(safe-area-inset-top))] border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex justify-between items-center shadow-sm z-50">
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden -ml-2"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
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
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
          >
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
                <DialogTitle>{t("conversationSummary")}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">
                {isSummarizing ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Sparkles className="h-5 w-5 animate-spin mr-2" />
                    {t("generatingSummary")}
                  </div>
                ) : (
                  summary || t("noSummary")
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea
        className="flex-1 h-full px-4"
        onScroll={onScroll}
        viewportRef={viewportRef}
      >
        <div className="space-y-6 pb-4 pt-[calc(4.5rem+env(safe-area-inset-top))]">
          <TrustBanner />
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`flex w-full mt-2 space-x-3 max-w-md ${
                    i % 2 === 0 ? "ml-auto justify-end" : ""
                  }`}
                >
                  {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                  <Skeleton
                    className={`h-12 rounded-2xl ${
                      i % 2 === 0
                        ? "w-48 rounded-br-none"
                        : "w-64 rounded-bl-none"
                    }`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {messages.map((msg, index) => {
                // Check if previous message is from same sender
                const isSameSender =
                  index > 0 &&
                  messages[index - 1].senderId._id === msg.senderId._id;
                // Check if next message is from same sender (for grouping visuals if needed later)
                // const isNextSameSender = index < messages.length - 1 && messages[index + 1].senderId._id === msg.senderId._id;

                return (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isMe={msg.senderId._id === session?.user?.id}
                    onDelete={handleDeleteMessage}
                    currentUserId={session?.user?.id}
                    isSameSender={isSameSender}
                  />
                );
              })}
            </AnimatePresence>
          )}
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
      <div className="p-3 md:p-4 border-t flex items-end gap-2 bg-background/80 backdrop-blur-md sticky bottom-0 z-50 shadow-lg pb-[env(safe-area-inset-bottom)]">
        <div className="flex-1 min-h-[48px] rounded-[24px] bg-muted/50 focus-within:ring-1 focus-within:ring-primary/20 flex flex-col justify-center">
          <ScrollArea className="w-full max-h-[150px] rounded-[24px]">
            <TextareaAutosize
              className="w-full bg-transparent border-0 px-4 py-3 text-base resize-none focus:outline-none placeholder:text-muted-foreground block overflow-hidden"
              placeholder={t("typeMessage")}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              minRows={1}
            />
          </ScrollArea>
        </div>
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
          className="h-12 w-12 rounded-xl bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 shadow-sm transition-all"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
