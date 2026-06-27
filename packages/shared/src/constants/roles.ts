export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  MODERATOR: "moderator",
  SUPER_ADMIN: "super_admin",
  PREMIUM: "premium",
} as const;

export const USER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SUSPENDED: "suspended",
  DELETED: "deleted",
} as const;

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  AUTO: "auto",
} as const;
