export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  preferredLanguage: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferredLanguage: string;
  role: string;
  isOnline: boolean;
  lastSeen: string | null;
}

export function toUserDTO(user: any): UserDTO {
  return {
    id: user._id?.toString() || user.id,
    name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    email: user.email,
    avatar: user.avatar || user.image,
    preferredLanguage: user.preferredLanguage || user.preferences?.language || "en",
    role: user.role || "user",
    isOnline: user.isOnline || false,
    lastSeen: user.lastSeen?.toISOString?.() || user.lastSeen || null,
  };
}

export function toUserSummary(user: any): UserSummary {
  return {
    _id: user._id?.toString() || user.id,
    name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    email: user.email,
    avatar: user.avatar || user.image,
    preferredLanguage: user.preferredLanguage || user.preferences?.language || "en",
  };
}
