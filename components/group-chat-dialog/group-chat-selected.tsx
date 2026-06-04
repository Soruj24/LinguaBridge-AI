"use client";

import { X } from "lucide-react";

interface SearchUser {
  _id: string;
  name: string;
}

interface GroupChatSelectedProps {
  userIds: string[];
  users: SearchUser[];
  onRemove: (userId: string) => void;
}

export function GroupChatSelected({
  userIds,
  users,
  onRemove,
}: GroupChatSelectedProps) {
  if (userIds.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-xl">
      {userIds.map((id) => {
        const user = users.find((u) => u._id === id);
        return user ? (
          <span
            key={id}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full text-xs font-medium"
          >
            {user.name}
            <button
              onClick={() => onRemove(id)}
              className="hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ) : null;
      })}
    </div>
  );
}
