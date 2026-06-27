import * as z from "zod";

export const settingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  preferredLanguage: z.string().min(2, "Language is required"),
  avatar: z.string().url().optional().or(z.literal("")),
  bio: z
    .string()
    .max(500, "Bio must be under 500 characters")
    .optional()
    .or(z.literal("")),
  showLastSeen: z.boolean(),
  showTypingIndicator: z.boolean(),
  showReadReceipts: z.boolean(),
  preferences: z.object({
    lowBandwidth: z.boolean(),
    reduceMotion: z.boolean(),
    highContrast: z.boolean(),
    autoPlayAudio: z.boolean(),
  }),
  emailPreferences: z.object({
    marketing: z.boolean(),
    security: z.boolean(),
  }),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
