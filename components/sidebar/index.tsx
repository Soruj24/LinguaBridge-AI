"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { SidebarHeader } from "./sidebar-header";
import { SidebarContent } from "./sidebar-content";
import { SidebarFooter } from "./sidebar-footer";
import { LanguageModal } from "@/components/language-modal";
import { AddFriendDialog } from "@/components/add-friend-dialog";
import { ContactImportDialog } from "@/components/contact-import-dialog";
import type { SidebarProps } from "@/types/sidebar";

export function Sidebar({ className, onClose }: SidebarProps) {
  const {
    incomingRequests,
    outgoingRequests,
    isLoading,
    searchQuery,
    setSearchQuery,
    acceptingIds,
    rejectingIds,
    activeTab,
    setActiveTab,
    onlineUsers,
    chatMap,
    filteredFriends,
    totalPending,
    fetchData,
    handleAccept,
    handleReject,
    cancelRequest,
    handleUnfriend,
    handleFriendClick,
    folders,
    createFolder,
    deleteFolder,
    assignChatToFolder,
    getFolderForChat,
    archiveChat,
    unarchiveChat,
  } = useSidebar();

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col h-screen w-80 border-r bg-background z-50",
        className,
      )}
    >
      <SidebarHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddFriend={() => setShowAddFriend(true)}
        onGroupChatCreated={fetchData}
        onClose={onClose}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalPending={totalPending}
      />

      <SidebarContent
        isLoading={isLoading}
        activeTab={activeTab}
        searchQuery={searchQuery}
        incomingRequests={incomingRequests}
        outgoingRequests={outgoingRequests}
        filteredFriends={filteredFriends}
        acceptingIds={acceptingIds}
        rejectingIds={rejectingIds}
        onlineUsers={onlineUsers}
        chatMap={chatMap}
        onAccept={handleAccept}
        onReject={handleReject}
        onCancelRequest={cancelRequest}
        onFriendClick={(friend) => {
          handleFriendClick(friend);
          onClose?.();
        }}
        onUnfriend={handleUnfriend}
        onOpenAddFriend={() => setShowAddFriend(true)}
        folders={folders}
        onCreateFolder={createFolder}
        onDeleteFolder={deleteFolder}
        onAssignChatToFolder={assignChatToFolder}
        getFolderForChat={getFolderForChat}
        onUnarchiveChat={unarchiveChat}
      />

      <SidebarFooter
        onOpenLanguageModal={() => setShowLanguageModal(true)}
        onOpenContacts={() => setShowContactDialog(true)}
      />

      <LanguageModal
        open={showLanguageModal}
        onOpenChange={setShowLanguageModal}
      />
      <AddFriendDialog
        open={showAddFriend}
        onOpenChange={setShowAddFriend}
        onAdded={fetchData}
      />
      <ContactImportDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
      />
    </div>
  );
}
