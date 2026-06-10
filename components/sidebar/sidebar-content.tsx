"use client";

import { usePathname } from "@/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSkeleton } from "./loading-skeleton";
import { RequestsList } from "./requests-list";
import { FriendsList } from "./friends-list";
import type { Friend, PendingRequest, ChatItem } from "@/types/sidebar";
import type { Folder } from "@/types/folders";

interface SidebarContentProps {
  isLoading: boolean;
  activeTab: "friends" | "requests";
  searchQuery: string;
  incomingRequests: PendingRequest[];
  outgoingRequests: PendingRequest[];
  filteredFriends: Friend[];
  acceptingIds: Set<string>;
  rejectingIds: Set<string>;
  onlineUsers: Set<string>;
  chatMap: Map<string, ChatItem>;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onCancelRequest: (id: string) => void;
  onFriendClick: (friend: Friend) => void;
  onUnfriend: (id: string) => void;
  onOpenAddFriend: () => void;
  folders: Folder[];
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onAssignChatToFolder: (chatId: string, folderId: string | null) => void;
  getFolderForChat: (chatId: string) => Folder | undefined;
  onUnarchiveChat: (chatId: string) => void;
}

export function SidebarContent(props: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <ScrollArea className="flex-1">
      {props.isLoading ? (
        <LoadingSkeleton />
      ) : props.activeTab === "requests" ? (
        <div className="p-3">
          <RequestsList
            incomingRequests={props.incomingRequests}
            outgoingRequests={props.outgoingRequests}
            acceptingIds={props.acceptingIds}
            rejectingIds={props.rejectingIds}
            onAccept={props.onAccept}
            onReject={props.onReject}
            onCancelRequest={props.onCancelRequest}
          />
        </div>
      ) : (
        <FriendsList
          filteredFriends={props.filteredFriends}
          onlineUsers={props.onlineUsers}
          chatMap={props.chatMap}
          pathname={pathname}
          onFriendClick={props.onFriendClick}
          onUnfriend={props.onUnfriend}
          searchQuery={props.searchQuery}
          onOpenAddFriend={props.onOpenAddFriend}
          folders={props.folders}
          onCreateFolder={props.onCreateFolder}
          onDeleteFolder={props.onDeleteFolder}
          onAssignChatToFolder={props.onAssignChatToFolder}
          getFolderForChat={props.getFolderForChat}
          onUnarchiveChat={props.onUnarchiveChat}
        />
      )}

    </ScrollArea>
  );
}
