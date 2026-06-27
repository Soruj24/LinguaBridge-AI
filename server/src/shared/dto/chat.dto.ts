export interface ChatDTO {
  _id: string;
  participants: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    preferredLanguage: string;
  }[];
  alwaysTranslate: boolean;
  autoTranslateLanguage: string | null;
  markedUnreadBy: string[];
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toChatDTO(chat: any): ChatDTO {
  return {
    _id: chat._id?.toString(),
    participants: (chat.participants || []).map((p: any) => ({
      _id: p._id?.toString?.() || p._id,
      name: p.name || "",
      email: p.email || "",
      avatar: p.avatar || p.image,
      preferredLanguage: p.preferredLanguage || "en",
    })),
    alwaysTranslate: chat.alwaysTranslate ?? false,
    autoTranslateLanguage: chat.autoTranslateLanguage ?? null,
    markedUnreadBy: (chat.markedUnreadBy || []).map((id: any) => id.toString?.() || id),
    isArchived: chat.isArchived ?? false,
    archivedAt: chat.archivedAt?.toISOString?.() ?? null,
    createdAt: chat.createdAt?.toISOString?.() ?? chat.createdAt,
    updatedAt: chat.updatedAt?.toISOString?.() ?? chat.updatedAt,
  };
}
