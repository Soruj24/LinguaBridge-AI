"use client";

import type { ReactNode } from "react";
import { AdminUserTableFilters } from "./admin-filter-bar";
import { AdminUserTableRow } from "./admin-user-table-row";
import { AdminUserTablePagination } from "./admin-pagination";

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
  const handleStatusToggle = (user: UserItem) => {
    if (onUpdateUser) {
      onUpdateUser({
        targetUserId: user._id,
        isActive: user.isActive === false,
      });
    }
  };

  const handleDeleteUser = (user: UserItem) => {
    if (
      onUpdateUser &&
      confirm(`Delete ${user.name}? This cannot be undone.`)
    ) {
      onUpdateUser({
        targetUserId: user._id,
        deleteUser: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      <AdminUserTableFilters
        search={search}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onSearchChange={onSearchChange ?? (() => {})}
        onRoleFilterChange={onRoleFilterChange ?? (() => {})}
        onStatusFilterChange={onStatusFilterChange ?? (() => {})}
        onRefresh={onRefresh}
      />

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
              {loading
                ? Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="p-4">
                          <div className="h-12 bg-muted animate-pulse rounded" />
                        </td>
                      </tr>
                    ))
                : users.length > 0
                  ? users.map((user) => (
                      <AdminUserTableRow
                        key={user._id}
                        user={user}
                        onEditUser={onEditUser ?? (() => {})}
                        onStatusToggle={handleStatusToggle}
                        onDeleteUser={handleDeleteUser}
                      />
                    ))
                  : (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-muted-foreground"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>

        <AdminUserTablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange ?? (() => {})}
        />
      </div>
    </div>
  );
}
