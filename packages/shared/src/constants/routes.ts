export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    REFRESH: "/api/auth/refresh",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    VERIFY_EMAIL: "/api/auth/verify-email",
  },
  USERS: {
    BASE: "/api/user",
    PROFILE: "/api/user/profile",
    SETTINGS: "/api/user/settings",
    SECURITY: "/api/user/security",
    SEARCH: "/api/user/search",
  },
  CHAT: {
    BASE: "/api/chat",
    MESSAGES: "/api/messages",
    SUGGESTIONS: "/api/ai/suggestions",
    REWRITE: "/api/ai/rewrite",
    TRANSLATE: "/api/ai/translate",
  },
  FRIENDS: {
    BASE: "/api/friends",
    REQUEST: "/api/friends/request",
    ACCEPT: "/api/friends/accept",
    DECLINE: "/api/friends/decline",
    BLOCK: "/api/friends/block",
    UNBLOCK: "/api/friends/unblock",
  },
  FOLDERS: {
    BASE: "/api/folders",
  },
  PHRASEBOOK: {
    BASE: "/api/phrasebook",
  },
  NOTIFICATIONS: {
    BASE: "/api/notifications",
  },
  BILLING: {
    BASE: "/api/billing",
    CHECKOUT: "/api/billing/checkout",
    SUBSCRIPTION: "/api/billing/subscription",
    INVOICES: "/api/billing/invoices",
  },
  ADMIN: {
    BASE: "/api/admin",
    USERS: "/api/admin/users",
    STATS: "/api/admin/stats",
  },
  FILES: {
    UPLOAD: "/api/files/upload",
  },
} as const;
