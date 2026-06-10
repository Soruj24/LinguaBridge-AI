"use client";

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/components/socket-provider";
import axios from "axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { Message, Chat } from "@/types/chat";

export function useChat(chatId: string) {
  const { data: session } = useSession();
  const socket = useSocket();
  const t = useTranslations("Chat");

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRestoringScroll, setIsRestoringScroll] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [scheduledMessages, setScheduledMessages] = useState<Message[]>([]);
  const [alwaysTranslate, setAlwaysTranslate] = useState(false);
  const [autoTranslateLanguage, setAutoTranslateLanguage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const searchResultRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const currentUserId = chat?.participants?.find(
    (p) => p.email === session?.user?.email,
  )?._id ?? session?.user?.id;

  const otherParticipant = chat?.participants?.find(
    (p) => p.email !== session?.user?.email,
  );

  const getReceiverId = useCallback(() => {
    const userEmail = session?.user?.email;
    if (!chat || !userEmail) return null;
    return chat.participants.find((p) => p.email !== userEmail)?._id;
  }, [chat, session?.user?.email]);

  const getSenderId = useCallback(() => {
    const userEmail = session?.user?.email;
    if (!chat || !userEmail) return null;
    return chat.participants.find((p) => p.email === userEmail)?._id;
  }, [chat, session?.user?.email]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, []);

  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    if (messageIds.length === 0) return;
    try {
      await axios.post("/api/chat/read", { chatId, messageIds });
      socket?.emit("messages_read", { chatId, messageIds, userId: currentUserId });
    } catch {
      // silently fail
    }
  }, [chatId, socket, currentUserId]);

  const fetchMessages = useCallback(async (before?: string) => {
    try {
      if (before) {
        setIsLoadingMore(true);
        if (viewportRef.current) {
          prevScrollHeightRef.current = viewportRef.current.scrollHeight;
          setIsRestoringScroll(true);
        }
      }

      const url = `/api/chat/${chatId}?limit=20` + (before ? `&before=${before}` : "");
      const res = await axios.get(url);

      if (before) {
        setMessages((prev) => [...res.data.messages, ...prev]);
      } else {
        setMessages(res.data.messages);
        setChat(res.data.chat);

        const myId = res.data.chat?.participants?.find(
          (p: { email: string }) => p.email === session?.user?.email,
        )?._id ?? session?.user?.id;

        const unreadIds = res.data.messages
          .filter((m: Message) => m.senderId._id !== myId && !m.readBy?.includes(myId))
          .map((m: Message) => m._id);

        if (unreadIds.length > 0) {
          try {
            await axios.post("/api/chat/read", { chatId, messageIds: unreadIds });
            socket?.emit("messages_read", { chatId, messageIds: unreadIds, userId: myId });
          } catch {
            // silently fail
          }
        }

        scrollToBottom();
      }
      setHasMore(res.data.hasMore);
    } catch {
      toast.error("Failed to load chat");
    } finally {
      if (!before) {
        setIsLoadingMore(false);
        setIsLoading(false);
      }
    }
  }, [chatId, scrollToBottom, session, socket]);

  const fetchSuggestions = useCallback(async () => {
    try {
      setIsLoadingSuggestions(true);
      const res = await axios.post(`/api/chat/${chatId}/suggestions`);
      if (res.data.suggestions) {
        setSuggestions(res.data.suggestions);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [chatId]);

  useEffect(() => {
    setIsLoading(true);
    fetchMessages();
    fetchSuggestions();
  }, [chatId, fetchMessages, fetchSuggestions]);

  useEffect(() => {
    if (chat) {
      setAlwaysTranslate((chat as Chat & { alwaysTranslate?: boolean }).alwaysTranslate ?? false);
      setAutoTranslateLanguage((chat as Chat & { autoTranslateLanguage?: string | null }).autoTranslateLanguage ?? null);
    }
  }, [chat]);

  const updateTranslateSettings = useCallback(async (enabled: boolean, language?: string | null) => {
    try {
      await axios.patch(`/api/chat/${chatId}`, {
        alwaysTranslate: enabled,
        autoTranslateLanguage: language ?? null,
      });
      setAlwaysTranslate(enabled);
      setAutoTranslateLanguage(language ?? null);
      toast.success(enabled ? "Auto-translate enabled" : "Auto-translate disabled");
    } catch {
      toast.error("Failed to update translation settings");
    }
  }, [chatId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_chat", chatId);

    socket.on("receive_message", (message: Message) => {
      if (message.chatId !== chatId || !message.senderId) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;

        const optimisticIndex = prev.findIndex(
          (m) =>
            m.isOptimistic &&
            m.originalText === message.originalText &&
            m.senderId?._id === message.senderId?._id,
        );

        if (optimisticIndex !== -1) {
          const next = [...prev];
          next[optimisticIndex] = message;
          return next;
        }
        return [...prev, message];
      });
      scrollToBottom();
      setIsTyping(false);

      if (message.senderId?._id !== getSenderId()) {
        fetchSuggestions();
        markMessagesAsRead([message._id]);
      }
    });

    socket.on("messages_read", ({ messageIds, userId }) => {
      setMessages((prev) => prev.map((m) =>
        messageIds.includes(m._id)
          ? { ...m, readBy: [...new Set([...(m.readBy || []), userId])] }
          : m
      ));
    });

    socket.on("typing", ({ chatId: eventChatId, userId }) => {
      if (eventChatId !== chatId) return;

      const sender = chat?.participants.find((p) => p._id === userId);
      if (sender && sender.email !== session?.user?.email) {
        setTypingUser(sender.name);
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          setTypingUser(null);
        }, 3000);
      }
    });

    socket.on("message_deleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });

    socket.on("message_pinned", ({ messageId, isPinned, message: updatedMessage }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isPinned, ...(updatedMessage ? { originalText: updatedMessage.originalText } : {}) }
            : m,
        ),
      );
    });

    socket.on("message_edited", (updatedMessage: Message) => {
      if (updatedMessage.chatId !== chatId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id === updatedMessage._id
            ? { ...m, originalText: updatedMessage.originalText, editedAt: updatedMessage.editedAt }
            : m,
        ),
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing");
      socket.off("message_deleted");
      socket.off("messages_read");
      socket.off("message_edited");
      socket.off("message_pinned");
    };
  }, [chatId, socket, chat, session, scrollToBottom, fetchSuggestions, getSenderId]);

  useLayoutEffect(() => {
    if (isRestoringScroll && viewportRef.current) {
      const diff = viewportRef.current.scrollHeight - prevScrollHeightRef.current;
      if (diff > 0) viewportRef.current.scrollTop = diff;
      setIsRestoringScroll(false);
      setIsLoadingMore(false);
    }
  }, [messages, isRestoringScroll]);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (distanceFromBottom > 300 && scrollRef.current) {
      // showScrollButton state managed locally
    }

    if (target.scrollTop === 0 && hasMore && !isLoadingMore && messages.length > 0) {
      fetchMessages(messages[0].createdAt);
    }
  }, [hasMore, isLoadingMore, messages, fetchMessages]);

  const handleEditMessage = useCallback(async (messageId: string, newText: string) => {
    if (!newText.trim()) return;
    try {
      const res = await axios.patch(`/api/chat/message/${messageId}`, { text: newText });
      const updatedMessage = res.data;
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, originalText: updatedMessage.originalText, editedAt: updatedMessage.editedAt } : m)),
      );
      socket?.emit("edit_message", { chatId, message: updatedMessage });
    } catch {
      toast.error("Failed to edit message");
    }
  }, [chatId, socket]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await axios.delete(`/api/chat/message/${messageId}`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      socket?.emit("delete_message", { chatId, messageId });
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  }, [chatId, socket]);

  const handlePinMessage = useCallback(async (messageId: string) => {
    try {
      const res = await axios.post(`/api/chat/message/${messageId}/pin`, { action: "pin" });
      const updatedMessage = res.data;
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isPinned: true } : m)),
      );
      toast.success("Message pinned");
    } catch {
      toast.error("Failed to pin message");
    }
  }, []);

  const handleUnpinMessage = useCallback(async (messageId: string) => {
    try {
      const res = await axios.post(`/api/chat/message/${messageId}/pin`, { action: "unpin" });
      const updatedMessage = res.data;
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isPinned: false } : m)),
      );
      toast.success("Message unpinned");
    } catch {
      toast.error("Failed to unpin message");
    }
  }, []);

  const pinnedMessages = messages
    .filter((m) => m.isPinned)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setNewMessage(e.target.value);
    if (socket && session?.user && chat) {
      const me = chat.participants.find((p) => p.email === session.user?.email);
      if (me) socket.emit("typing", { chatId, userId: me._id });
    }
  }, [socket, session?.user, chat, chatId]);

  const handleSuggestionClick = useCallback((text: string) => {
    setNewMessage(text);
  }, []);

  const handleRewrite = useCallback(async (tone: string) => {
    if (!newMessage.trim()) return;
    try {
      setIsRewriting(true);
      const res = await axios.post("/api/chat/rewrite", { text: newMessage, tone });
      if (res.data.rewritten) {
        setNewMessage(res.data.rewritten);
        toast.success(t("rewrittenAs", { tone }));
      }
    } catch {
      toast.error(t("rewriteFailed"));
    } finally {
      setIsRewriting(false);
    }
  }, [newMessage, t]);

  const handleGifSelect = useCallback(async (gifUrl: string) => {
    const receiverId = getReceiverId();
    const senderId = getSenderId();
    if (!receiverId || !senderId) return;

    if (socket) {
      socket.emit("send_message", { chatId, receiverId, senderId, text: gifUrl },
        (response: { status: string }) => {
          if (response?.status !== "ok") {
            toast.error(t("sendFailed"));
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
        originalText: gifUrl,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      setMessages((prev) => [...prev, tempMessage]);
      scrollToBottom();
    }
  }, [getReceiverId, getSenderId, socket, chatId, session, scrollToBottom, t]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;
    const receiverId = getReceiverId();
    const senderId = getSenderId();
    if (!receiverId || !senderId) return;

    if (socket) {
      const replyToId = replyingTo?._id;

      socket.emit("send_message", { chatId, receiverId, senderId, text: newMessage, replyToId },
        (response: { status: string }) => {
          if (response?.status !== "ok") {
            toast.error(t("sendFailed"));
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
        replyTo: replyingTo
          ? {
              _id: replyingTo._id,
              originalText: replyingTo.originalText,
              senderId: { _id: replyingTo.senderId._id, name: replyingTo.senderId.name },
              fileUrl: replyingTo.fileUrl,
              isImage: replyingTo.isImage,
            }
          : undefined,
      };

      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");
      setSuggestions([]);
      setReplyingTo(null);
      scrollToBottom();
    }
  }, [newMessage, getReceiverId, getSenderId, socket, chatId, session, scrollToBottom, t, replyingTo]);

  const sendVoiceMessage = useCallback(async (audioBlob: Blob) => {
    const receiverId = getReceiverId();
    if (!receiverId) return;

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "voice.webm");
      formData.append("chatId", chatId);
      formData.append("receiverId", receiverId);

      const res = await axios.post("/api/chat/voice", formData);
      socket?.emit("send_message", res.data);
      setMessages((prev) => [...prev, res.data]);
      scrollToBottom();
    } catch {
      toast.error("Failed to send voice message");
    }
  }, [getReceiverId, chatId, socket, scrollToBottom]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  }, []);

  const sendFileMessage = useCallback(async () => {
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
    } catch {
      toast.error("Failed to send file");
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, getReceiverId, chatId, socket, scrollToBottom]);

  const startRecording = useCallback(async () => {
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
    } catch {
      toast.error("Microphone access denied");
    }
  }, [sendVoiceMessage]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
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
  }, [chatId]);

  const handleForwardMessage = useCallback(async (messageId: string, targetChatId: string) => {
    try {
      const res = await axios.post("/api/chat/forward", { messageId, targetChatId });
      const msg = res.data;

      if (msg.chatId === chatId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }

      toast.success("Message forwarded");
      return msg;
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) && err.response?.data?.error
        ? err.response.data.error
        : "Failed to forward message";
      toast.error(errorMsg);
      throw err;
    }
  }, [chatId, scrollToBottom]);

  const handleClearChat = useCallback(async () => {
    try {
      await axios.patch(`/api/chat/${chatId}`, { action: "clear" });
      setMessages([]);
      toast.success("Chat cleared");
    } catch {
      toast.error("Failed to clear chat");
    }
  }, [chatId]);

  const fetchScheduledMessages = useCallback(async () => {
    try {
      const res = await axios.get(`/api/chat/scheduled?chatId=${chatId}`);
      setScheduledMessages(res.data);
    } catch {
      // silently fail
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId) fetchScheduledMessages();
  }, [chatId, fetchScheduledMessages]);

  const handleSchedule = useCallback(async (text: string, scheduledAt: string) => {
    try {
      const res = await axios.post("/api/chat/schedule", { chatId, text, scheduledAt });
      const scheduledMsg = res.data;
      setMessages((prev) => [...prev, scheduledMsg]);
      setNewMessage("");
      setSuggestions([]);
      scrollToBottom();
      fetchScheduledMessages();
      toast.success("Message scheduled");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data?.error
        ? err.response.data.error
        : "Failed to schedule message";
      toast.error(msg);
    }
  }, [chatId, scrollToBottom, fetchScheduledMessages, setNewMessage]);

  const exportChat = useCallback(async (chatId: string, format: "json" | "txt") => {
    try {
      const res = await axios.get(`/api/chat/${chatId}/export?format=${format}`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], {
        type: format === "json" ? "application/json" : "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-${chatId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Chat exported successfully");
    } catch {
      toast.error("Failed to export chat");
    }
  }, []);

  const handleCancelScheduled = useCallback(async (messageId: string) => {
    try {
      await axios.delete(`/api/chat/scheduled/${messageId}`);
      setScheduledMessages((prev) => prev.filter((m) => m._id !== messageId));
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      toast.success("Scheduled message cancelled");
    } catch {
      toast.error("Failed to cancel scheduled message");
    }
  }, []);

  const scrollToMessage = useCallback((msgId: string) => {
    const el = searchResultRefs.current.get(msgId) || document.getElementById(`message-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setSearchResults([]);
    }
  }, []);

  return {
    messages, chat, setChat, newMessage, setNewMessage,
    isTyping, typingUser, hasMore, isLoading, isLoadingMore,
    suggestions, isLoadingSuggestions, isRewriting,
    selectedFile, setSelectedFile, isUploading, isRecording,
    searchResults, isSearching,
    scrollRef, viewportRef, prevScrollHeightRef,
    searchResultRefs, mediaRecorderRef,
    currentUserId, otherParticipant, replyingTo, setReplyingTo,
    fetchMessages, fetchSuggestions, markMessagesAsRead, sendMessage,
    sendVoiceMessage, sendFileMessage,
    handleDeleteMessage, handleEditMessage, handlePinMessage, handleUnpinMessage,
    pinnedMessages, handleRewrite, handleSearch,
    handleClearChat, handleForwardMessage, handleInputChange, handleSuggestionClick,
    handleFileSelect, handleGifSelect, startRecording, stopRecording,
    scrollToBottom, scrollToMessage, onScroll,
    handleSchedule, handleCancelScheduled, fetchScheduledMessages, scheduledMessages,
    exportChat,
    alwaysTranslate, autoTranslateLanguage, updateTranslateSettings,
  };
}
