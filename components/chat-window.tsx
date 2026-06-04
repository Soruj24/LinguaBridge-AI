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

export function ChatWindow({ chatId }: { chatId: string }) {
  const {
    messages, chat, newMessage, setNewMessage, setSelectedFile,
    isTyping, typingUser, hasMore, isLoading, isLoadingMore,
    suggestions, isRewriting, selectedFile, isUploading, isRecording,
    searchResults, isSearching,
    scrollRef, viewportRef,
    currentUserId, otherParticipant,
    sendMessage, sendFileMessage,
    handleDeleteMessage, handleRewrite, handleSearch,
    handleClearChat, handleInputChange, handleSuggestionClick,
    handleFileSelect, startRecording, stopRecording,
    scrollToBottom, scrollToMessage, onScroll,
  } = useChat(chatId);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      <ChatBackground />

      <ChatWindowHeader
        otherParticipant={otherParticipant}
        onToggleSearch={() => setIsSearchOpen((v) => !v)}
        onOpenChatInfo={() => setShowChatInfo(true)}
        onOpenClearConfirm={() => setShowClearConfirm(true)}
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
        onScrollToBottom={scrollToBottom}
        scrollRef={scrollRef}
        viewportRef={viewportRef}
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
        onRewrite={handleRewrite}
        isRewriting={isRewriting}
        onStickerSelect={(emoji: string) => setNewMessage((prev: string) => prev + emoji)}
      />

      <ChatInfoDialog
        open={showChatInfo}
        onOpenChange={setShowChatInfo}
        chat={chat}
        messages={messages}
      />

      <ClearChatDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        onConfirm={handleClearChat}
      />
    </div>
  );
}
