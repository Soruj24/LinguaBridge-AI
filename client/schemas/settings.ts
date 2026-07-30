import { z } from "zod";

export const settingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  preferredLanguage: z.string().default("en"),
  avatar: z.string().optional(),
  showLastSeen: z.boolean().default(true),
  showTypingIndicator: z.boolean().default(true),
  showReadReceipts: z.boolean().default(true),
  preferences: z.object({
    lowBandwidth: z.boolean().default(false),
    reduceMotion: z.boolean().default(false),
    highContrast: z.boolean().default(false),
    autoPlayAudio: z.boolean().default(true),
  }).default({}),
  emailPreferences: z.object({
    marketing: z.boolean().default(true),
    security: z.boolean().default(true),
  }).default({}),
});
export type SettingsFormValues = z.infer<typeof settingsSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().optional(),
  preferredLanguage: z.string().optional(),
});
export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;
