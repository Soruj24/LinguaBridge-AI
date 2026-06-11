export interface PhrasebookEntry {
  _id: string;
  originalText: string;
  translatedText: string;
  languageFrom: string;
  languageTo: string;
  sourceMessageId?: string;
  sourceChatId?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
}
