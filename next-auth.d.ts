import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: "user" | "admin"
      preferredLanguage?: string
      avatar?: string
      preferences?: {
        lowBandwidth: boolean
        reduceMotion: boolean
        highContrast: boolean
        autoPlayAudio: boolean
      }
    } & DefaultSession["user"]
  }

  interface User {
      role?: "user" | "admin"
      preferredLanguage?: string
      avatar?: string
      preferences?: {
        lowBandwidth: boolean
        reduceMotion: boolean
        highContrast: boolean
        autoPlayAudio: boolean
      }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: "user" | "admin"
    preferredLanguage?: string
    avatar?: string
    preferences?: {
      lowBandwidth: boolean
      reduceMotion: boolean
      highContrast: boolean
      autoPlayAudio: boolean
    }
  }
}
