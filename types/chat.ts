export interface Message {
  _id: string;
  chatId: string;
  senderId: { _id: string; name: string; email: string; avatar?: string };
  receiverId?: { _id: string; name: string; email: string; avatar?: string };
  originalText: string;
  translatedText?: string;
  voiceUrl?: string;
  translatedVoiceUrl?: string;
  fileUrl?: string;
  isImage?: boolean;
  createdAt: string;
  isOptimistic?: boolean;
  readBy?: string[];
  replyTo?: {
    _id: string;
    originalText: string;
    senderId: { _id: string; name: string };
    fileUrl?: string;
    isImage?: boolean;
  };
  isPinned?: boolean;
  editedAt?: string | null;
  scheduledAt?: string;
  status?: "scheduled" | "sent" | "failed";
}

export interface Chat {
  _id: string;
  participants: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    preferredLanguage: string;
  }[];
  alwaysTranslate?: boolean;
  autoTranslateLanguage?: string | null;
  markedUnreadBy?: string[];
  isArchived?: boolean;
  archivedAt?: string | null;
}

export const LANGUAGE_FLAGS: Record<string, string> = {
  en: "\uD83C\uDDEC\uD83C\uDDE7", es: "\uD83C\uDDEA\uD83C\uDDF8", fr: "\uD83C\uDDEB\uD83C\uDDF7",
  de: "\uD83C\uDDE9\uD83C\uDDEA", it: "\uD83C\uDDEE\uD83C\uDDF9", pt: "\uD83C\uDDF5\uD83C\uDDF9",
  ru: "\uD83C\uDDF7\uD83C\uDDFA", ja: "\uD83C\uDDEF\uD83C\uDDF5", ko: "\uD83C\uDDF0\uD83C\uDDF7",
  zh: "\uD83C\uDDE8\uD83C\uDDF3", ar: "\uD83C\uDDF8\uD83C\uDDE6", hi: "\uD83C\uDDEE\uD83C\uDDF3",
  bn: "\uD83C\uDDE7\uD83C\uDDEC", pa: "\uD83C\uDDEE\uD83C\uDDF3", ta: "\uD83C\uDDEE\uD83C\uDDF3",
  th: "\uD83C\uDDF9\uD83C\uDDED", vi: "\uD83C\uDDFB\uD83C\uDDF3", nl: "\uD83C\uDDF3\uD83C\uDDF1",
  pl: "\uD83C\uDDF5\uD83C\uDDF1", tr: "\uD83C\uDDF9\uD83C\uDDF7",
};

export const getLanguageFlag = (lang: string) => LANGUAGE_FLAGS[lang] ?? "\uD83C\uDF10";

export function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (dateDay.getTime() === today.getTime()) return "Today";
  if (dateDay.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric",
  });
}

export function needsDateSeparator(current: Message, previous?: Message): boolean {
  if (!previous) return true;
  const d1 = new Date(current.createdAt);
  const d2 = new Date(previous.createdAt);
  return (
    d1.getFullYear() !== d2.getFullYear() ||
    d1.getMonth() !== d2.getMonth() ||
    d1.getDate() !== d2.getDate()
  );
}
