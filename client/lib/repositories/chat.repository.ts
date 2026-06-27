import api from "@/lib/api";

// ─── Message Operations ──────────────────────────────────────────────────────

export async function editMessageApi(messageId: string, text: string) {
  const { data } = await api.patch(`/api/chat/message/${messageId}`, { text });
  return data;
}

export async function deleteMessageApi(messageId: string) {
  const { data } = await api.delete(`/api/chat/message/${messageId}`);
  return data;
}

export async function pinMessageApi(messageId: string, action: "pin" | "unpin") {
  const { data } = await api.post(`/api/chat/message/${messageId}/pin`, { action });
  return data;
}

export async function fetchMessagesApi(chatId: string, limit = 20, before?: string) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.append("before", before);
  const { data } = await api.get(`/api/chat/${chatId}?${params.toString()}`);
  return data;
}

export async function markAsReadApi(chatId: string, messageIds: string[]) {
  const { data } = await api.post("/api/chat/read", {
    chatId,
    messageIds,
  });
  return data;
}

export async function searchMessagesApi(query: string, chatId?: string) {
  const params = new URLSearchParams({ q: query });
  if (chatId) params.append("chatId", chatId);
  const { data } = await api.get(`/api/chat/search?${params.toString()}`);
  return data;
}

// ─── Chat Operations ─────────────────────────────────────────────────────────

export async function fetchChatSuggestionsApi(chatId: string) {
  const { data } = await api.post(`/api/chat/${chatId}/suggestions`);
  return data;
}

export async function updateTranslateSettingsApi(
  chatId: string,
  alwaysTranslate: boolean,
  autoTranslateLanguage: string | null,
) {
  const { data } = await api.patch(`/api/chat/${chatId}`, {
    alwaysTranslate,
    autoTranslateLanguage,
  });
  return data;
}

export async function archiveChatApi(chatId: string, action: "archive" | "unarchive") {
  const { data } = await api.post(`/api/chat/${chatId}/archive`, { action });
  return data;
}

export async function clearChatApi(chatId: string) {
  const { data } = await api.patch(`/api/chat/${chatId}`, { action: "clear" });
  return data;
}

export async function exportChatApi(chatId: string, format: "json" | "txt") {
  const { data } = await api.get(`/api/chat/${chatId}/export?format=${format}`, {
    responseType: "blob",
  });
  return data;
}

export async function rewriteMessageApi(text: string, tone: string) {
  const { data } = await api.post("/api/chat/rewrite", { text, tone });
  return data;
}

// ─── Voice ───────────────────────────────────────────────────────────────────

export async function sendVoiceMessageApi(formData: FormData) {
  const { data } = await api.post("/api/chat/voice", formData);
  return data;
}

export async function voiceTranslateApi(formData: FormData) {
  const { data } = await api.post("/api/chat/voice-translate", formData);
  return data;
}

// ─── File ────────────────────────────────────────────────────────────────────

export async function sendFileApi(formData: FormData) {
  const { data } = await api.post("/api/chat/file", formData);
  return data;
}

// ─── Forward ─────────────────────────────────────────────────────────────────

export async function forwardMessageApi(messageId: string, targetChatId: string) {
  const { data } = await api.post("/api/chat/forward", {
    messageId,
    targetChatId,
  });
  return data;
}

// ─── Scheduled Messages ─────────────────────────────────────────────────────

export async function fetchScheduledMessagesApi(chatId: string) {
  const { data } = await api.get(`/api/chat/scheduled?chatId=${chatId}`);
  return data;
}

export async function scheduleMessageApi(chatId: string, text: string, scheduledAt: string) {
  const { data } = await api.post("/api/chat/schedule", {
    chatId,
    text,
    scheduledAt,
  });
  return data;
}

export async function cancelScheduledMessageApi(messageId: string) {
  const { data } = await api.delete(`/api/chat/scheduled/${messageId}`);
  return data;
}

// ─── GIFs ────────────────────────────────────────────────────────────────────

export async function searchGifsApi(query: string) {
  const { data } = await api.get(`/api/chat/gifs?q=${encodeURIComponent(query)}`);
  return data;
}

// ─── Phrasebook ──────────────────────────────────────────────────────────────

export async function saveToPhrasebookApi(data: {
  originalText: string;
  translatedText: string;
  languageFrom: string;
  languageTo: string;
  sourceMessageId: string;
}) {
  const { data: result } = await api.post("/api/phrasebook", data);
  return result;
}
