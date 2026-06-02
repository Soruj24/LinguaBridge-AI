"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "@/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  UserX,
  UserCheck,
  Globe,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface UserItem {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  preferredLanguage?: string;
  role?: "user" | "admin";
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

interface UserTableProps {
  users: UserItem[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  search?: string;
  roleFilter?: string;
  statusFilter?: string;
  onSearchChange?: (value: string) => void;
  onRoleFilterChange?: (value: string) => void;
  onStatusFilterChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onEditUser?: (user: UserItem) => void;
  onUpdateUser?: (payload: Record<string, unknown>) => void;
  onRefresh?: () => void;
}

export function AdminUserTable({
  users,
  loading,
  page = 1,
  totalPages = 1,
  search = "",
  roleFilter = "all",
  statusFilter = "all",
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onPageChange,
  onEditUser,
  onUpdateUser,
  onRefresh,
}: UserTableProps) {
  const router = useRouter();

  const handleStatusToggle = (user: UserItem) => {
    if (onUpdateUser) {
      onUpdateUser({
        targetUserId: user._id,
        isActive: user.isActive === false,
      });
    }
  };

  const handleDeleteUser = (user: UserItem) => {
    if (onUpdateUser && confirm(`Delete ${user.name}? This cannot be undone.`)) {
      onUpdateUser({
        targetUserId: user._id,
        deleteUser: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center bg-card rounded-2xl border p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        )}
      </div>

      <div className="bg-card rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Language</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="p-4">
                        <div className="h-12 bg-muted animate-pulse rounded" />
                      </td>
                    </tr>
                  ))
              ) : users.length ? (
                users.map((user) => (
                  <tr key={user._id} className="border-t hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditUser?.(user)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusToggle(user)}
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
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}