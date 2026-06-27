"use client";

import { useState, useCallback } from "react";
import { ChatBackground } from "@/components/ui/chat-background";
import { useChat } from "@/hooks/use-chat";
import {
  ChatWindowHeader,
  ChatSearch,
  ChatMessageList,
  ChatInputArea,
  ChatInfoDialog,
  ClearChatDialog,
} from "@/components/chat";
import { ForwardDialog } from "@/components/chat/forward-dialog";
import { PhrasebookDrawer } from "@/components/phrasebook/phrasebook-drawer";
import { useChatApi } from "@/hooks/use-chat-api";
import type { MessageBubbleMessage } from "@/components/message-bubble/types";
import type { ChatItem } from "@/types/sidebar";

export function ChatWindow({ chatId }: { chatId: string }) {
  const {
    messages, chat, setChat, newMessage, setNewMessage, setSelectedFile,
    isTyping, typingUser, hasMore, isLoading, isLoadingMore,
    suggestions, selectedFile, isUploading, isRecording,
    searchResults, isSearching,
    scrollRef, viewportRef,
    currentUserId, otherParticipant, replyingTo, setReplyingTo,
    sendMessage, sendFileMessage,
    handleDeleteMessage, handleEditMessage, handlePinMessage, handleUnpinMessage,
    pinnedMessages, handleSearch,
    handleClearChat, handleForwardMessage, handleInputChange, handleSuggestionClick,
    handleFileSelect, handleGifSelect, startRecording, stopRecording,
    scrollToBottom, scrollToMessage, onScroll,
    handleSchedule, handleCancelScheduled, scheduledMessages,
    exportChat,
    alwaysTranslate, autoTranslateLanguage, updateTranslateSettings,
  } = useChat(chatId);

  const { archiveChat } = useChatApi();
  const [chats] = useState<ChatItem[]>([]);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPhrasebook, setShowPhrasebook] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [forwardMessage, setForwardMessage] = useState<MessageBubbleMessage | null>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    onScroll(e);
    const target = e.currentTarget;
    setShowScrollButton(target.scrollHeight - target.scrollTop - target.clientHeight > 200);
  }, [onScroll]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleCloseSearch = () => {
    setSearchQuery("");
    handleSearch("");
  };

  const handleResultClick = (msgId: string) => {
    scrollToMessage(msgId);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleArchiveToggle = useCallback(async () => {
    const action = chat?.isArchived ? "unarchive" : "archive";
    const success = await archiveChat(chatId, action as "archive" | "unarchive");
    if (success) {
      setChat((prev) => prev ? { ...prev, isArchived: !prev.isArchived } : null);
    }
  }, [chatId, chat?.isArchived, archiveChat]);

  return (
    <div className="relative flex flex-col h-full">
      <ChatBackground />

      <ChatWindowHeader
        chatId={chatId}
        otherParticipant={otherParticipant}
        onToggleSearch={() => setIsSearchOpen((v) => !v)}
        onOpenChatInfo={() => setShowChatInfo(true)}
        onOpenClearConfirm={() => setShowClearConfirm(true)}
        onOpenPhrasebook={() => setShowPhrasebook(true)}
        scheduledMessages={scheduledMessages}
        onCancelScheduled={handleCancelScheduled}
        exportChat={exportChat}
        isArchived={chat?.isArchived}
        onArchiveToggle={handleArchiveToggle}
        pinnedMessages={pinnedMessages}
        onUnpinMessage={handleUnpinMessage}
      />

      <ChatSearch
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        searchQuery={searchQuery}
        onSearch={handleSearchChange}
        searchResults={searchResults}
        isSearching={isSearching}
        onResultClick={handleResultClick}
      />

      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        currentUserId={currentUserId}
        isTyping={isTyping}
        typingUser={typingUser}
        showScrollButton={showScrollButton}
        onScroll={handleScroll}
        onDelete={handleDeleteMessage}
        onEdit={handleEditMessage}
        onScrollToBottom={scrollToBottom}
        scrollRef={scrollRef}
        viewportRef={viewportRef}
        onReply={setReplyingTo}
        onPin={handlePinMessage}
        onUnpin={handleUnpinMessage}
        onForward={setForwardMessage}
      />

      <ChatInputArea
        newMessage={newMessage}
        onInputChange={handleInputChange}
        onSend={sendMessage}
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onFileRemove={() => setSelectedFile(null)}
        onFileSend={sendFileMessage}
        isUploading={isUploading}
        isRecording={isRecording}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onStickerSelect={(emoji: string) => setNewMessage((prev: string) => prev + emoji)}
        onGifSelect={handleGifSelect}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onSchedule={(scheduledAt) => handleSchedule(newMessage, scheduledAt)}
      />

      <ChatInfoDialog
        open={showChatInfo}
        onOpenChange={setShowChatInfo}
        chat={chat}
        messages={messages}
        alwaysTranslate={alwaysTranslate}
        autoTranslateLanguage={autoTranslateLanguage}
        onToggleAlwaysTranslate={updateTranslateSettings}
      />

      <ClearChatDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        onConfirm={handleClearChat}
      />

      <PhrasebookDrawer
        open={showPhrasebook}
        onOpenChange={setShowPhrasebook}
      />

      <ForwardDialog
        open={forwardMessage !== null}
        onOpenChange={(open) => { if (!open) setForwardMessage(null); }}
        message={forwardMessage}
        chats={chats}
        onForward={handleForwardMessage}
      />
    </div>
  );
}
