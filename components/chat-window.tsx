"use client";

import { Fragment, useEffect, useState, useRef, useLayoutEffect } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "./socket-provider";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TextareaAutosize from "react-textarea-autosize";
import {
  Send, Sparkles, Wand2, ArrowLeft, MessageCircle, Paperclip,
  ChevronDown, User, Search, Info, Trash2, Mic, StopCircle, Loader2, X,
} from "lucide-react";
import { useRouter } from "@/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MessageBubble } from "@/components/message-bubble";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { TypingIndicator } from "@/components/typing-indicator";
import { TrustBanner } from "@/components/trust-banner";
import { ChatBackground } from "@/components/ui/chat-background";
import { useTranslations } from "next-intl";
import { FilePreview } from "@/components/ui/file-preview";
import { StickerPicker } from "@/components/sticker-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

const LANGUAGE_FLAGS: Record<string, string> = {
  en: "\uD83C\uDDEC\uD83C\uDDE7", es: "\uD83C\uDDEA\uD83C\uDDF8", fr: "\uD83C\uDDEB\uD83C\uDDF7",
  de: "\uD83C\uDDE9\uD83C\uDDEA", it: "\uD83C\uDDEE\uD83C\uDDF9", pt: "\uD83C\uDDF5\uD83C\uDDF9",
  ru: "\uD83C\uDDF7\uD83C\uDDFA", ja: "\uD83C\uDDEF\uD83C\uDDF5", ko: "\uD83C\uDDF0\uD83C\uDDF7",
  zh: "\uD83C\uDDE8\uD83C\uDDF3", ar: "\uD83C\uDDF8\uD83C\uDDE6", hi: "\uD83C\uDDEE\uD83C\uDDF3",
  bn: "\uD83C\uDDE7\uD83C\uDDEC", pa: "\uD83C\uDDEE\uD83C\uDDF3", ta: "\uD83C\uDDEE\uD83C\uDDF3",
  th: "\uD83C\uDDF9\uD83C\uDDED", vi: "\uD83C\uDDFB\uD83C\uDDF3", nl: "\uD83C\uDDF3\uD83C\uDDF1",
  pl: "\uD83C\uDDF5\uD83C\uDDF1", tr: "\uD83C\uDDF9\uD83C\uDDF7",
};

const getLanguageFlag = (lang: string) => LANGUAGE_FLAGS[lang] ?? "\uD83C\uDF10";

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (dateDay.getTime() === today.getTime()) return "Today";
  if (dateDay.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric",
  });
}

function needsDateSeparator(current: Message, previous?: Message): boolean {
  if (!previous) return true;
  const d1 = new Date(current.createdAt);
  const d2 = new Date(previous.createdAt);
  return (
    d1.getFullYear() !== d2.getFullYear() ||
    d1.getMonth() !== d2.getMonth() ||
    d1.getDate() !== d2.getDate()
  );
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
  const [isRewriting, setIsRewriting] = useState(false);
  const [isRestoringScroll, setIsRestoringScroll] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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
        if (message.chatId === chatId && message.senderId) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === message._id)) return prev;

            const optimisticMatchIndex = prev.findIndex(
              (m) =>
                m.isOptimistic &&
                m.originalText === message.originalText &&
                m.senderId?._id === message.senderId?._id,
            );

            if (optimisticMatchIndex !== -1) {
              const newMessages = [...prev];
              newMessages[optimisticMatchIndex] = message;
              return newMessages;
            }

            return [...prev, message];
          });
          scrollToBottom();
          setIsTyping(false);

          if (message.senderId?._id !== getSenderId()) {
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
    const threshold = 200;
    setShowScrollButton(target.scrollHeight - target.scrollTop - target.clientHeight > threshold);

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
            setNewMessage(newMessage);
          }
        },
      );

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
      setSuggestions([]);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const sendFileMessage = async () => {
    if (!selectedFile) return;
    const receiverId = getReceiverId();
    if (!receiverId) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("chatId", chatId);
      formData.append("receiverId", receiverId);

      const res = await axios.post("/api/chat/file", formData);

      socket?.emit("send_message", res.data);
      setMessages((prev) => [...prev, res.data]);
      setSelectedFile(null);
      scrollToBottom();
      toast.success("File sent");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send file");
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        sendVoiceMessage(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearching(true);
      const res = await axios.get(`/api/chat/search?q=${encodeURIComponent(query)}&chatId=${chatId}`);
      setSearchResults(res.data);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await axios.patch(`/api/chat/${chatId}`, { action: "clear" });
      setMessages([]);
      setShowClearConfirm(false);
      toast.success("Chat cleared");
    } catch {
      toast.error("Failed to clear chat");
    }
  };

  const searchResultRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const scrollToMessage = (msgId: string) => {
    const el = searchResultRefs.current.get(msgId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const currentUserId = chat?.participants?.find(
    (p) => p.email === session?.user?.email,
  )?._id ?? session?.user?.id;

  const otherParticipant = chat?.participants?.find(
    (p) => p.email !== session?.user?.email,
  );

  return (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      <ChatBackground />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-3 md:px-5 py-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden -ml-1 h-9 w-9 shrink-0 rounded-xl hover:bg-muted/70"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {otherParticipant && (
              <button
                onClick={() => router.push(`/profile/${otherParticipant._id}`)}
                className="flex items-center gap-3 min-w-0 text-left hover:opacity-80 transition-opacity"
              >
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/15 ring-offset-2 ring-offset-background">
                    <AvatarImage src={otherParticipant.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold text-sm">
                      {otherParticipant.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-[2.5px] border-background" />
                </div>
                <div className="min-w-0 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-[15px] truncate group-hover:underline">
                      {otherParticipant.name}
                    </h2>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[11px] font-medium border border-primary/15">
                      {getLanguageFlag(otherParticipant.preferredLanguage)}
                      {otherParticipant.preferredLanguage === "en"
                        ? "English"
                        : otherParticipant.preferredLanguage}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    <span>Online</span>
                  </div>
                </div>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-muted/70"
                >
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1.5">
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg"
                  onClick={() =>
                    router.push(
                      `/profile/${otherParticipant?._id}`,
                    )
                  }
                >
                  <User className="mr-2.5 h-4 w-4" />
                  <span>{t("viewProfile")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  <Search className="mr-2.5 h-4 w-4" />
                  <span>{t("searchChat")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg"
                  onClick={() => setShowChatInfo(true)}
                >
                  <Info className="mr-2.5 h-4 w-4" />
                  <span>Chat info</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={() => setShowClearConfirm(true)}
                >
                  <Trash2 className="mr-2.5 h-4 w-4" />
                  <span>{t("clearChat")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── SEARCH BAR ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border/50 bg-background/80 backdrop-blur-xl"
          >
            <div className="px-3 md:px-5 py-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/50 border border-border/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">No results found</p>
                  ) : (
                    searchResults.map((msg) => (
                      <button
                        key={msg._id}
                        onClick={() => scrollToMessage(msg._id)}
                        className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                      >
                        <span className="font-medium text-xs text-muted-foreground">
                          {msg.senderId?.name}
                        </span>
                        <p className="text-xs truncate text-foreground/80">{msg.originalText}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MESSAGE AREA ── */}
      <ScrollArea
        className="flex-1 h-full"
        onScroll={onScroll}
        viewportRef={viewportRef}
      >
        <div className="space-y-3 px-3 md:px-5 pb-3 pt-4">
          <TrustBanner />

          {isLoading ? (
            <div className="space-y-4 py-4">
              {[
                { align: "left", width: "w-56", avatar: true },
                { align: "right", width: "w-48", avatar: false },
                { align: "right", width: "w-64", avatar: false },
                { align: "left", width: "w-72", avatar: true },
                { align: "left", width: "w-40", avatar: false },
                { align: "right", width: "w-52", avatar: false },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex w-full items-end gap-2 ${
                    item.align === "right" ? "justify-end" : "justify-start"
                  }`}
                >
                  {item.align === "left" && item.avatar && (
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  )}
                  {item.align === "left" && !item.avatar && (
                    <div className="w-8 shrink-0" />
                  )}
                  <div className="space-y-2">
                    <Skeleton
                      className={`h-10 rounded-2xl ${
                        item.align === "right"
                          ? "rounded-br-sm"
                          : "rounded-bl-sm"
                      } ${item.width}`}
                    />
                    <Skeleton
                      className={`h-3 ${
                        item.align === "right" ? "ml-auto" : ""
                      } w-12 rounded`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 px-4 text-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative mb-6"
              >
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center backdrop-blur-sm">
                    <MessageCircle className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                </motion.div>
              </motion.div>
              <h3 className="font-semibold text-lg text-foreground mb-1.5">
                {t("noMessages")}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
                {t("noMessagesDesc")}
              </p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                {t("aiWillHelp")}
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((msg, index) => {
                const prevMsg = index > 0 ? messages[index - 1] : undefined;
                const showDateSep = needsDateSeparator(msg, prevMsg);
                const isSameSender =
                  !showDateSep &&
                  index > 0 &&
                  prevMsg?.senderId?._id === msg.senderId?._id;

                return (
                  <Fragment key={msg._id}>
                    {showDateSep && (
                      <div className="flex items-center gap-3 py-2">
                        <div className="flex-1 h-px bg-gradient-to-r from-border/0 via-border/60 to-border/0" />
                        <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest shrink-0">
                          {formatDateLabel(msg.createdAt)}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-border/0 via-border/60 to-border/0" />
                      </div>
                    )}
                    <MessageBubble
                      message={msg}
                      isMe={msg.senderId?._id === currentUserId}
                      onDelete={handleDeleteMessage}
                      currentUserId={currentUserId}
                      isSameSender={isSameSender}
                    />
                  </Fragment>
                );
              })}
            </>
          )}

          {isTyping && typingUser && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 ring-2 ring-muted">
                <AvatarFallback className="text-xs bg-muted">
                  {typingUser[0]}
                </AvatarFallback>
              </Avatar>
              <TypingIndicator userName={typingUser} />
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* ── SCROLL TO BOTTOM ── */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() =>
              scrollRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="absolute bottom-20 right-5 z-40 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 flex items-center justify-center text-primary-foreground hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── INPUT AREA ── */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl sticky bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
        {/* Smart Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 overflow-x-auto px-3 md:px-5 pt-3 pb-2 scrollbar-hide">
                {suggestions.map((suggestion, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-sm font-medium text-foreground hover:from-primary/20 hover:to-primary/10 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Sparkles className="h-3 w-3 text-primary shrink-0" />
                    <span>{suggestion}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Preview */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-3 md:px-5"
            >
              <div className="py-2">
                <FilePreview
                  file={selectedFile}
                  onRemove={() => setSelectedFile(null)}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={sendFileMessage}
                    disabled={isUploading}
                    className="h-8 rounded-lg text-xs gap-1.5 bg-primary hover:bg-primary/90"
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Send File
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Input */}
        <div className="flex items-end gap-2 px-3 md:px-5 py-2.5">
          <div className="flex-1 min-h-[46px] rounded-2xl bg-muted/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-muted/70 border border-border/40 flex flex-col transition-all">
            <TextareaAutosize
              className="w-full bg-transparent border-0 px-4 pt-3 pb-1.5 text-sm resize-none focus:outline-none placeholder:text-muted-foreground/60 leading-relaxed"
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

            {/* Toolbar */}
            <div className="flex items-center justify-between px-2 pb-1.5">
              <div className="flex items-center gap-0.5">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-muted-foreground/10"
                    asChild
                  >
                    <span>
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground/70" />
                    </span>
                  </Button>
                </label>

                <StickerPicker
                  onSelect={(emoji: string) => {
                    setNewMessage((prev: string) => prev + emoji);
                  }}
                />

                {isRecording ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20"
                    onClick={stopRecording}
                    title="Stop recording"
                  >
                    <StopCircle className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-muted-foreground/10"
                    onClick={startRecording}
                    title="Voice message"
                  >
                    <Mic className="h-3.5 w-3.5 text-muted-foreground/70" />
                  </Button>
                )}
              </div>

              <span className="text-[10px] text-muted-foreground/50 px-1">
                {newMessage.length > 0 && `${newMessage.length}`}
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-xl hover:bg-muted/50 hidden sm:inline-flex"
                  disabled={!newMessage.trim() || isRewriting}
                  title="Rewrite"
                >
                  <Wand2
                    className={`h-4 w-4 ${
                      isRewriting ? "animate-spin text-primary" : "text-muted-foreground/70"
                    }`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 p-1">
                <DropdownMenuItem
                  onClick={() => handleRewrite("Formal")}
                  className="cursor-pointer rounded-md"
                >
                  <span className="mr-2 text-base">👔</span> Formal
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleRewrite("Casual")}
                  className="cursor-pointer rounded-md"
                >
                  <span className="mr-2 text-base">😎</span> Casual
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleRewrite("Professional")}
                  className="cursor-pointer rounded-md"
                >
                  <span className="mr-2 text-base">💼</span> Professional
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleRewrite("Friendly")}
                  className="cursor-pointer rounded-md"
                >
                  <span className="mr-2 text-base">😊</span> Friendly
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleRewrite("Concise")}
                  className="cursor-pointer rounded-md"
                >
                  <span className="mr-2 text-base">✂️</span> Concise
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── CHAT INFO DIALOG ── */}
      <Dialog open={showChatInfo} onOpenChange={setShowChatInfo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chat Info</DialogTitle>
            <DialogDescription>
              Details about this conversation
            </DialogDescription>
          </DialogHeader>
          {chat && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Participants</h4>
                {chat.participants.map((p) => (
                  <div key={p._id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={p.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {p.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.preferredLanguage}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Messages</span>
                <span className="font-medium">{messages.length}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── CLEAR CHAT CONFIRMATION ── */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Clear this chat?</DialogTitle>
            <DialogDescription>
              This will delete all messages in this conversation. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearChat}
            >
              Clear
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
