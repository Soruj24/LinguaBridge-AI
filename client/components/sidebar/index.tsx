"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./sidebar-header";
import { SidebarContent } from "./sidebar-content";
import { SidebarFooter } from "./sidebar-footer";
import { LanguageModal } from "@/components/language-modal";
import { AddFriendDialog } from "@/components/add-friend-dialog";
import { ContactImportDialog } from "@/components/ui/contact-import-dialog";
import type { SidebarProps, Friend, PendingRequest, ChatItem } from "@/types/sidebar";
import type { Folder } from "@/types/folders";

export function Sidebar({ className, onClose }: SidebarProps) {
  const [incomingRequests, setIncomingRequests] = useState<PendingRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());
  const [rejectingIds, setRejectingIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"chats" | "friends" | "requests">("chats");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [chatMap, setChatMap] = useState<Map<string, ChatItem>>(new Map());
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [totalPending, setTotalPending] = useState(0);
  const [folders, setFolders] = useState<Folder[]>([]);

  const fetchData = async () => {};
  const handleAccept = async (id: string) => {};
  const handleReject = async (id: string) => {};
  const cancelRequest = async (id: string) => {};
  const handleUnfriend = async (id: string) => {};
  const handleFriendClick = (friend: unknown) => {};
  const createFolder = async (name: string) => {};
  const deleteFolder = async (id: string) => {};
  const assignChatToFolder = async (chatId: string, folderId: string | null) => {};
  const getFolderForChat = (chatId: string) => undefined;
  const archiveChat = async (chatId: string, action: "archive" | "unarchive") => {};
  const unarchiveChat = async (chatId: string) => {};

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
