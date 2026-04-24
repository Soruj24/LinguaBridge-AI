"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "./socket-provider";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TextareaAutosize from "react-textarea-autosize";
import { Send, Sparkles, Wand2, ArrowLeft, MessageCircle, Image, Paperclip, X, Search, Smile } from "lucide-react";
import { useRouter } from "@/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MessageBubble } from "@/components/message-bubble";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { TypingIndicator } from "@/components/typing-indicator";
import { TrustBanner } from "@/components/trust-banner";
import { ChatBackground } from "@/components/ui/chat-background";
import { useTranslations } from "next-intl";
import { FilePreview } from "@/components/ui/file-preview";
import { StickerPicker } from "@/components/sticker-picker";

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
  const [isRewriting, setIsRewriting] = useState(false);
  const [isRestoringScroll, setIsRestoringScroll] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20 relative">
      <ChatBackground />
      {/* Header - Fixed/Absolute on top */}
      <div className="absolute top-0 left-0 right-0 p-3 md:p-4 pt-[calc(0.75rem+env(safe-area-inset-top))] md:pt-[calc(1rem+env(safe-area-inset-top))] border-b bg-background/80 backdrop-blur-xl flex justify-between items-center shadow-sm z-50">
        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden -ml-1 h-10 w-10 shrink-0 hover:bg-muted"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {chat?.participants
            .filter((p) => p.email !== session?.user?.email)
            .map((p) => (
              <div key={p._id} className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <Avatar className="h-11 w-11 border-2 border-primary/20 shrink-0 shadow-md">
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
                      {p.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-base md:text-lg truncate">{p.name}</h2>
                  <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {p.preferredLanguage === "en" ? "English" : p.preferredLanguage}{" "}
                    Speaker
                  </p>
                </div>
              </div>
            ))}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-muted transition-colors"
            title="More options"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </Button>
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
              {messages.length === 0 && !isLoading ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-16 px-4 text-center"
                >
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 shadow-inner">
                    <MessageCircle className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {t('noMessages')}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mb-4">
                    {t('noMessagesDesc')}
                  </p>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-xs text-primary font-medium">
                      {t('aiWillHelp')}
                    </span>
                  </div>
                </motion.div>
              ) : messages.map((msg, index) => {
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
              <TypingIndicator userName={typingUser} />
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
      <div className="p-3 md:p-4 border-t bg-background/80 backdrop-blur-xl sticky bottom-0 z-50 shadow-lg pb-[env(safe-area-inset-bottom)]">
        {/* Smart Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {suggestions.map((suggestion, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-sm font-medium text-foreground hover:from-primary/20 hover:to-primary/10 transition-all cursor-pointer shadow-sm shrink-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {suggestion}
              </motion.button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 min-h-[48px] rounded-2xl bg-muted/60 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-muted flex flex-col justify-center transition-all border border-muted/40">
            <ScrollArea className="w-full max-h-[150px] rounded-2xl">
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
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">
                  {t('tapToTranslate')}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {(newMessage.length || selectedFile?.size) && `${newMessage.length || selectedFile?.size}`}
              </span>
            </div>
          </div>
          {/* Selected File Preview */}
          {selectedFile && (
            <div className="px-2 py-2">
              <FilePreview
                file={selectedFile}
                onRemove={() => setSelectedFile(null)}
              />
            </div>
          )}
          <div className="flex items-center gap-1">
            {/* File Upload Button */}
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <label htmlFor="file-upload">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-muted transition-colors"
                asChild
              >
                <span>
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                </span>
              </Button>
            </label>
            <span className="flex">
              <StickerPicker onSelect={(emoji: string) => {
                setNewMessage((prev: string) => prev + emoji);
              }} />
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl hover:bg-muted transition-colors"
                  disabled={!newMessage.trim() || isRewriting}
                  title="Rewrite Message"
                >
                  <Wand2
                    className={`h-4 w-4 ${isRewriting ? "animate-spin text-primary" : "text-muted-foreground"}`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1">
                <DropdownMenuItem onClick={() => handleRewrite("Formal")} className="cursor-pointer">
                  <span className="mr-2">👔</span> {t('formal')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRewrite("Casual")} className="cursor-pointer">
                  <span className="mr-2">😎</span> {t('casual')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRewrite("Professional")} className="cursor-pointer">
                  <span className="mr-2">💼</span> {t('professional')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRewrite("Friendly")} className="cursor-pointer">
                  <span className="mr-2">😊</span> {t('friendly')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRewrite("Concise")} className="cursor-pointer">
                  <span className="mr-2">✂️</span> {t('concise')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="h-11 w-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
