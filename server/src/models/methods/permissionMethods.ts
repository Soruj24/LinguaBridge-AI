import { Schema } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { UserRole, Permission } from "../interfaces/IUser";

export const applyPermissionMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.hasPermission = function (permission: string): boolean {
    if (this.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    if (this.permissions && this.permissions.includes(permission as Permission)) {
      return true;
    }

    const rolePermissions: Record<string, string[]> = {
      [UserRole.ADMIN]: [
        Permission.USERS_VIEW,
        Permission.USERS_CREATE,
        Permission.USERS_EDIT,
        Permission.USERS_DELETE,
        Permission.ROLES_VIEW,
        Permission.ROLES_EDIT,
        Permission.CONTENT_VIEW,
        Permission.CONTENT_CREATE,
        Permission.CONTENT_EDIT,
        Permission.CONTENT_DELETE,
        Permission.SYSTEM_VIEW,
        Permission.SYSTEM_SETTINGS,
        Permission.ANALYTICS_VIEW,
        Permission.TICKETS_VIEW,
        Permission.TICKETS_EDIT,
        Permission.BILLING_VIEW,
        Permission.BILLING_EDIT,
      ],
      [UserRole.MODERATOR]: [
        Permission.USERS_VIEW,
        Permission.CONTENT_VIEW,
        Permission.CONTENT_CREATE,
        Permission.CONTENT_EDIT,
        Permission.TICKETS_VIEW,
        Permission.TICKETS_EDIT,
      ],
      [UserRole.PREMIUM]: [
        Permission.CONTENT_VIEW,
        Permission.CONTENT_CREATE,
        Permission.CONTENT_EDIT,
      ],
      [UserRole.USER]: [
        Permission.CONTENT_VIEW
      ]
    };

    const permissions = rolePermissions[this.role as UserRole] || [];
    return permissions.includes(permission);
  };

  schema.methods.hasAllPermissions = function (permissions: string[]): boolean {
    return permissions.every(p => this.hasPermission(p));
  };

  schema.methods.hasAnyPermission = function (permissions: string[]): boolean {
    return permissions.some(p => this.hasPermission(p));
  };

  schema.methods.getAllPermissions = function (): Permission[] {
    if (this.role === UserRole.SUPER_ADMIN) {
      return Object.values(Permission) as Permission[];
    }

    const explicitPermissions = (this.permissions || []) as Permission[];

    const rolePermissionsMap: Record<string, Permission[]> = {
      [UserRole.ADMIN]: [
        Permission.USERS_VIEW,
        Permission.USERS_CREATE,
        Permission.USERS_EDIT,
        Permission.USERS_DELETE,
        Permission.ROLES_VIEW,
        Permission.ROLES_EDIT,
        Permission.CONTENT_VIEW,
        Permission.CONTENT_CREATE,
        Permission.CONTENT_EDIT,
        Permission.CONTENT_DELETE,
        Permission.SYSTEM_VIEW,
        Permission.SYSTEM_SETTINGS,
        Permission.ANALYTICS_VIEW,
        Permission.TICKETS_VIEW,
        Permission.TICKETS_EDIT,
        Permission.BILLING_VIEW,
        Permission.BILLING_EDIT,
      ],
      [UserRole.MODERATOR]: [
        Permission.USERS_VIEW,
        Permission.CONTENT_VIEW,
        Permission.CONTENT_CREATE,
        Permission.CONTENT_EDIT,
        Permission.TICKETS_VIEW,
        Permission.TICKETS_EDIT,
      ],
      [UserRole.PREMIUM]: [
        Permission.CONTENT_VIEW,
        Permission.CONTENT_CREATE,
        Permission.CONTENT_EDIT,
      ],
      [UserRole.USER]: [
        Permission.CONTENT_VIEW
      ]
    };

    const defaultPermissions = rolePermissionsMap[this.role as UserRole] || [];

    return Array.from(new Set([...explicitPermissions, ...defaultPermissions]));
  };

  schema.methods.getRoleLevel = function (): number {
    const roleLevels: Record<string, number> = {
      [UserRole.USER]: 1,
      [UserRole.PREMIUM]: 2,
      [UserRole.MODERATOR]: 3,
      [UserRole.ADMIN]: 4,
      [UserRole.SUPER_ADMIN]: 5
    };

    return roleLevels[this.role as UserRole] || 0;
  };

  schema.methods.isAdminUser = function (): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
  };
};
