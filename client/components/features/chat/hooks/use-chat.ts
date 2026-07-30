"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/providers/socket-provider";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { Message, Chat } from "@/types/shared";
import {
  editMessageApi,
  deleteMessageApi,
  pinMessageApi,
  fetchChatSuggestionsApi,
  updateTranslateSettingsApi,
  rewriteMessageApi,
  sendVoiceMessageApi,
  sendFileApi,
  forwardMessageApi,
  clearChatApi,
  exportChatApi,
} from "@/lib/repositories/chat.repository";
import { useChatMessages } from "./use-chat-messages";
import { useChatVoice } from "./use-chat-voice";
import { useChatSearch } from "./use-chat-search";
import { useChatSchedule } from "./use-chat-schedule";

export function useChat(chatId: string) {
  const { data: session } = useSession();
  const socket = useSocket();
  const t = useTranslations("Chat");

  const [chat, setChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [alwaysTranslate, setAlwaysTranslate] = useState(false);
  const [autoTranslateLanguage, setAutoTranslateLanguage] = useState<string | null>(null);

  const currentUserId = chat?.participants?.find(
    (p) => p.email === session?.user?.email,
  )?._id ?? session?.user?.id;

  const otherParticipant = chat?.participants?.find(
    (p) => p.email !== session?.user?.email,
  );

  const getReceiverId = useCallback(() => {
    const userEmail = session?.user?.email;
    if (!chat || !userEmail) return undefined;
    return chat.participants.find((p) => p.email !== userEmail)?._id;
  }, [chat, session?.user?.email]);

  const getSenderId = useCallback(() => {
    const userEmail = session?.user?.email;
    if (!chat || !userEmail) return undefined;
    return chat.participants.find((p) => p.email === userEmail)?._id;
  }, [chat, session?.user?.email]);

  const {
    messages, setMessages,
    hasMore, setIsLoading, isLoading, isLoadingMore,
    scrollRef, viewportRef,
    scrollToBottom, markMessagesAsRead, fetchMessages,
    onScroll,
  } = useChatMessages({ chatId, currentUserId, socket });

  const {
    isRecording, mediaRecorderRef,
    startRecording, stopRecording,
  } = useChatVoice({
    getReceiverId,
    chatId,
    socket,
    onMessageSent: (msg) => setMessages((prev) => [...prev, msg]),
    scrollToBottom,
  });

  const {
    searchResults, setSearchResults,
    isSearching,
    searchResultRefs,
    handleSearch,
    scrollToMessage,
  } = useChatSearch({ chatId });

  const {
    scheduledMessages,
    handleSchedule,
    handleCancelScheduled,
  } = useChatSchedule({ chatId, scrollToBottom, setNewMessage });

  const fetchSuggestions = useCallback(async () => {
    try {
      setIsLoadingSuggestions(true);
      const res = await fetchChatSuggestionsApi(chatId);
      if (res.suggestions) {
        setSuggestions(res.suggestions);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [chatId]);

  useEffect(() => {
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
      await updateTranslateSettingsApi(chatId, enabled, language ?? null);
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
        setTimeout(() => {
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
  }, [chatId, socket, chat, session, scrollToBottom, fetchSuggestions, getSenderId, setMessages, markMessagesAsRead]);

  const handleEditMessage = useCallback(async (messageId: string, newText: string) => {
    if (!newText.trim()) return;
    try {
      const updatedMessage = await editMessageApi(messageId, newText);
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, originalText: updatedMessage.originalText, editedAt: updatedMessage.editedAt } : m)),
      );
      socket?.emit("edit_message", { chatId, message: updatedMessage });
    } catch {
      toast.error("Failed to edit message");
    }
  }, [chatId, socket, setMessages]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await deleteMessageApi(messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      socket?.emit("delete_message", { chatId, messageId });
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  }, [chatId, socket, setMessages]);

  const handlePinMessage = useCallback(async (messageId: string) => {
    try {
      await pinMessageApi(messageId, "pin");
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isPinned: true } : m)),
      );
      toast.success("Message pinned");
    } catch {
      toast.error("Failed to pin message");
    }
  }, [setMessages]);

  const handleUnpinMessage = useCallback(async (messageId: string) => {
    try {
      await pinMessageApi(messageId, "unpin");
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isPinned: false } : m)),
      );
      toast.success("Message unpinned");
    } catch {
      toast.error("Failed to unpin message");
    }
  }, [setMessages]);

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
      const res = await rewriteMessageApi(newMessage, tone);
      if (res.rewritten) {
        setNewMessage(res.rewritten);
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
  }, [getReceiverId, getSenderId, socket, chatId, session, scrollToBottom, t, setMessages]);

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
  }, [newMessage, getReceiverId, getSenderId, socket, chatId, session, scrollToBottom, t, replyingTo, setMessages]);

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

      const res = await sendFileApi(formData);
      socket?.emit("send_message", res);
      setMessages((prev) => [...prev, res]);
      setSelectedFile(null);
      scrollToBottom();
      toast.success("File sent");
    } catch {
      toast.error("Failed to send file");
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, getReceiverId, chatId, socket, scrollToBottom, setMessages]);

  const handleForwardMessage = useCallback(async (messageId: string, targetChatId: string) => {
    try {
      const msg = await forwardMessageApi(messageId, targetChatId);

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
      const errorMsg = err instanceof Error ? err.message : "Failed to forward message";
      toast.error(errorMsg);
      throw err;
    }
  }, [chatId, scrollToBottom, setMessages]);

  const handleClearChat = useCallback(async () => {
    try {
      await clearChatApi(chatId);
      setMessages([]);
      toast.success("Chat cleared");
    } catch {
      toast.error("Failed to clear chat");
    }
  }, [chatId, setMessages]);

  const exportChat = useCallback(async (chatId: string, format: "json" | "txt") => {
    try {
      const res = await exportChatApi(chatId, format);
      const blob = new Blob([res], {
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

  return {
    messages, chat, setChat, newMessage, setNewMessage,
    isTyping, typingUser, hasMore, isLoading, isLoadingMore,
    suggestions, isLoadingSuggestions, isRewriting,
    selectedFile, setSelectedFile, isUploading, isRecording,
    searchResults, isSearching,
    scrollRef, viewportRef,
    searchResultRefs, mediaRecorderRef,
    currentUserId, otherParticipant, replyingTo, setReplyingTo,
    fetchMessages, fetchSuggestions, markMessagesAsRead, sendMessage,
    sendVoiceMessage: useCallback(async (audioBlob: Blob) => {
      const receiverId = getReceiverId();
      if (!receiverId) return;

      try {
        const formData = new FormData();
        formData.append("file", audioBlob, "voice.webm");
        formData.append("chatId", chatId);
        formData.append("receiverId", receiverId);

        const res = await sendVoiceMessageApi(formData);
        socket?.emit("send_message", res);
        setMessages((prev) => [...prev, res]);
        scrollToBottom();
      } catch {
        toast.error("Failed to send voice message");
      }
    }, [getReceiverId, chatId, socket, scrollToBottom, setMessages]),
    sendFileMessage,
    handleDeleteMessage, handleEditMessage, handlePinMessage, handleUnpinMessage,
    pinnedMessages, handleRewrite, handleSearch,
    handleClearChat, handleForwardMessage, handleInputChange, handleSuggestionClick,
    handleFileSelect, handleGifSelect, startRecording, stopRecording,
    scrollToBottom, scrollToMessage, onScroll,
    handleSchedule, handleCancelScheduled, scheduledMessages,
    exportChat,
    alwaysTranslate, autoTranslateLanguage, updateTranslateSettings,
  };
}
