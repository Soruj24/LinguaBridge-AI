"use client";

import {
  Edit2,
  Trash2,
  UserX,
  UserCheck,
  Globe,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserItem } from "./user-table";

interface AdminUserTableRowProps {
  user: UserItem;
  onEditUser: (user: UserItem) => void;
  onStatusToggle: (user: UserItem) => void;
  onDeleteUser: (user: UserItem) => void;
}

export function AdminUserTableRow({
  user,
  onEditUser,
  onStatusToggle,
  onDeleteUser,
}: AdminUserTableRowProps) {
  return (
    <tr className="border-t hover:bg-muted/30">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <Badge
          variant={user.role === "admin" ? "default" : "secondary"}
        >
          {user.role || "user"}
        </Badge>
      </td>
      <td className="p-4">
        <Badge
          variant={user.isActive !== false ? "outline" : "destructive"}
          className="gap-1"
        >
          {user.isActive !== false ? (
            <>
              <UserCheck className="h-3 w-3" /> Active
            </>
          ) : (
            <>
              <UserX className="h-3 w-3" /> Inactive
            </>
          )}
        </Badge>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-1 text-sm">
          <Globe className="h-4 w-4 text-muted-foreground" />
          {user.preferredLanguage || "en"}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => onEditUser?.(user)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStatusToggle(user)}
          >
            {user.isActive !== false ? (
              <UserX className="h-4 w-4 text-destructive" />
            ) : (
              <UserCheck className="h-4 w-4 text-green-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteUser(user)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
