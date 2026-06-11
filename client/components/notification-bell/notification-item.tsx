"use client";

import {
  Bell,
  MessageSquare,
  Shield,
  AlertTriangle,
  Users,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

function getIcon(type: string) {
  switch (type) {
    case "message":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "security":
      return <Shield className="h-4 w-4 text-orange-500" />;
    case "admin":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "friend_request":
      return <Users className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  return (
    <button
      onClick={() => onClick(notification)}
      className={cn(
        "w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left",
        !notification.isRead && "bg-primary/5",
      )}
    >
      <div className="mt-1 p-2 rounded-full bg-muted">
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">{notification.title}</p>
          {!notification.isRead && (
            <span className="h-2 w-2 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </div>
      </div>
    </button>
  );
}
