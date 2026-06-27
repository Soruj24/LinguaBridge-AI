// Services
export { processMessage } from "./services/chatService";
export { getUser, getOrCreateUser, logLoginActivity, authorizeCredentials } from "./services/auth";
export { getProfileData } from "./services/profileService";
export { checkAndSendScheduledMessages, startScheduler, stopScheduler } from "./services/messageScheduler";
export { sendEmail, sendEmailWithPreferenceCheck } from "./services/emailService";

// AI Services
export { translateText, detectLanguage, processTranslationPipeline } from "./services/ai/translation";
export { transcribeAudio, textToSpeech, translateVoice } from "./services/ai/audio";
export { generateSmartReplies, summarizeChat } from "./services/ai/chat";
export { rewriteText } from "./services/ai/rewrite";

// Config
export { default as connectDB } from "./config/connectDB";

// Socket
export { getIO, setIO } from "./socket/ioInstance";
export { setupSocketHandlers } from "./socket/handlers";

// Utils
export { isBlocked } from "./utils/blockCheck";
export { languageMap, languages } from "./utils/languages";
export { formatLastSeen } from "./utils/lastSeen";
export { parseUserAgent, getClientIP, formatDeviceInfo, timeAgo } from "./utils/userAgent";

// Middleware
export { rateLimit } from "./middleware/rateLimit";

// Models
export {
  ChatUser,
  Chat,
  ChatMessage,
  Friendship,
  Block,
  ChatNotification,
  UserStatus,
  PhrasebookEntry,
  Folder,
  Report,
  LoginActivity,
} from "./models/chat";

// Types
export type {
  IChatUser,
  IChat,
  IMessage,
  IFriendship,
  IBlock,
  IChatNotification,
  IUserStatus,
  IPhrasebookEntry,
  IFolder,
  IReport,
  ILoginActivity,
  SocketMessage,
  ProcessedMessage,
  ApiResponse,
  PaginatedResponse,
} from "./types/chat";
