export interface Friend {
  friendshipId: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    preferredLanguage: string;
  };
  since: string;
}

export interface PendingRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    preferredLanguage: string;
  };
  createdAt: string;
}

export interface ChatItem {
  _id: string;
  participants: { _id: string }[];
  lastMessage?: {
    originalText: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount?: number;
  markedUnreadBy?: string[];
  updatedAt: string;
  folderId?: string | null;
  isArchived?: boolean;
  archivedAt?: string | null;
}

export interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
