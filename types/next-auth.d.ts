import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: "user" | "admin"
      preferredLanguage?: string
      avatar?: string
      showTypingIndicator?: boolean
      showReadReceipts?: boolean
      preferences?: {
        lowBandwidth: boolean
        reduceMotion: boolean
        highContrast: boolean
        autoPlayAudio: boolean
      }
      isEmailVerified?: boolean
      notificationPreferences?: {
        enabledTypes: string[]
        doNotDisturb: { enabled: boolean; startTime: string; endTime: string }
        sound: string
        vibration: boolean
        showPreview: boolean
      }
    } & DefaultSession["user"]
  }

  interface User {
    role?: "user" | "admin"
    preferredLanguage?: string
    avatar?: string
    _id?: string
    showTypingIndicator?: boolean
    showReadReceipts?: boolean
    preferences?: {
      lowBandwidth: boolean
      reduceMotion: boolean
      highContrast: boolean
      autoPlayAudio: boolean
    }
    isEmailVerified?: boolean
    notificationPreferences?: {
      enabledTypes: string[]
      doNotDisturb: { enabled: boolean; startTime: string; endTime: string }
      sound: string
      vibration: boolean
      showPreview: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: "user" | "admin"
    preferredLanguage?: string
    avatar?: string
    showTypingIndicator?: boolean
    showReadReceipts?: boolean
    preferences?: {
      lowBandwidth: boolean
      reduceMotion: boolean
      highContrast: boolean
      autoPlayAudio: boolean
    }
    isEmailVerified?: boolean
    notificationPreferences?: {
      enabledTypes: string[]
      doNotDisturb: { enabled: boolean; startTime: string; endTime: string }
      sound: string
      vibration: boolean
      showPreview: boolean
    }
  }
}
