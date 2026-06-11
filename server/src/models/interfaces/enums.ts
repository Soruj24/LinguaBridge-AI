import { Types } from "mongoose";

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  SUSPENDED = "suspended",
  DELETED = "deleted",
}

export enum UserRole {
  USER = "user",
  MODERATOR = "moderator",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
  PREMIUM = "premium",
}

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
  AUTO = "auto",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
  PREFER_NOT_TO_SAY = "prefer-not-to-say",
}

export enum AddressType {
  HOME = "home",
  WORK = "work",
  BILLING = "billing",
  SHIPPING = "shipping",
  OTHER = "other",
} 

export enum Permission {
  USERS_VIEW = "users:view",
  USERS_CREATE = "users:create",
  USERS_EDIT = "users:edit",
  USERS_DELETE = "users:delete",
  ROLES_VIEW = "roles:view",
  ROLES_EDIT = "roles:edit",
  CONTENT_VIEW = "content:view",
  CONTENT_CREATE = "content:create",
  CONTENT_EDIT = "content:edit",
  CONTENT_DELETE = "content:delete",
  SYSTEM_VIEW = "system:view",
  SYSTEM_SETTINGS = "system:settings",
  ANALYTICS_VIEW = "analytics:view",
  TICKETS_VIEW = "tickets:view",
  TICKETS_EDIT = "tickets:edit",
  BILLING_VIEW = "billing:view",
  BILLING_EDIT = "billing:edit",
}

export enum ProfileVisibility {
  PUBLIC = "public",
  FRIENDS = "friends",
  PRIVATE = "private",
}
