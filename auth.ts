import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { authConfig } from "./auth.config";
import { authorizeCredentials, getOrCreateUser, logLoginActivity } from "@/lib/auth-service";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      async authorize(credentials, req) {
        return authorizeCredentials(
          credentials as Record<string, unknown> | undefined,
          req?.headers?.get("user-agent") ?? undefined,
        );
      },
    }),
  ],
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          const authUser = await getOrCreateUser({
            email: user.email!,
            name: user.name,
            image: user.image,
          });

          user._id = authUser._id.toString();
          user.role = authUser.role;
          user.preferredLanguage = authUser.preferredLanguage;
          user.avatar = authUser.avatar;

          await logLoginActivity({
            userId: authUser._id.toString(),
            email: user.email!,
            type: "login",
            success: true,
            provider: account.provider,
          });
        } catch (error) {
          console.error("Error in signIn event:", error);
        }
      }
    },
    async signOut() {},
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as {
          _id?: string | { toString(): string };
          id?: string;
          role?: "user" | "admin";
          preferredLanguage?: string;
          avatar?: string;
          isEmailVerified?: boolean;
          showTypingIndicator?: boolean;
          showReadReceipts?: boolean;
          preferences?: {
            lowBandwidth: boolean;
            reduceMotion: boolean;
            highContrast: boolean;
            autoPlayAudio: boolean;
          };
          emailPreferences?: {
            marketing: boolean;
            security: boolean;
          };
          notificationPreferences?: {
            enabledTypes: string[];
            doNotDisturb: { enabled: boolean; startTime: string; endTime: string };
            sound: string;
            vibration: boolean;
            showPreview: boolean;
          };
        };

        token.id = String(u._id?.toString() || u.id || "");
        token.role = (u.role ?? "user") as "user" | "admin";
        token.preferredLanguage = u.preferredLanguage || "en";
        token.avatar = u.avatar || undefined;
        token.isEmailVerified = u.isEmailVerified || false;
        token.showTypingIndicator = u.showTypingIndicator ?? true;
        token.showReadReceipts = u.showReadReceipts ?? true;
        token.preferences = u.preferences ? { ...u.preferences } : undefined;
        token.emailPreferences = u.emailPreferences ? { ...u.emailPreferences } : undefined;
        token.notificationPreferences = u.notificationPreferences
          ? {
              ...u.notificationPreferences,
              enabledTypes: Array.isArray(u.notificationPreferences.enabledTypes)
                ? [...u.notificationPreferences.enabledTypes]
                : [],
              doNotDisturb: u.notificationPreferences.doNotDisturb
                ? { ...u.notificationPreferences.doNotDisturb }
                : { enabled: false, startTime: "", endTime: "" },
            }
          : undefined;
      }

      if (trigger === "update" && session) {
        token.preferredLanguage = session.preferredLanguage;
        token.avatar = session.avatar;
        if (session.user?.preferences) {
          token.preferences = { ...session.user.preferences };
        }
        if (session.user?.emailPreferences) {
          token.emailPreferences = { ...session.user.emailPreferences };
        }
        if (session.user?.notificationPreferences) {
          const np = session.user.notificationPreferences as Record<string, unknown>;
          token.notificationPreferences = {
            enabledTypes: Array.isArray(np.enabledTypes) ? [...(np.enabledTypes as string[])] : [],
            doNotDisturb: np.doNotDisturb && typeof np.doNotDisturb === "object"
              ? { enabled: Boolean((np.doNotDisturb as Record<string, unknown>).enabled), startTime: String((np.doNotDisturb as Record<string, unknown>).startTime || ""), endTime: String((np.doNotDisturb as Record<string, unknown>).endTime || "") }
              : { enabled: false, startTime: "", endTime: "" },
            sound: typeof np.sound === "string" ? np.sound : "default",
            vibration: typeof np.vibration === "boolean" ? np.vibration : true,
            showPreview: typeof np.showPreview === "boolean" ? np.showPreview : true,
          };
        }
        if (typeof session.showTypingIndicator === "boolean") {
          token.showTypingIndicator = session.showTypingIndicator;
        }
        if (typeof session.showReadReceipts === "boolean") {
          token.showReadReceipts = session.showReadReceipts;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "user" | "admin" | undefined) ?? "user";
        session.user.preferredLanguage = token.preferredLanguage;
        session.user.avatar = token.avatar;
        session.user.image = token.avatar || session.user.image;
        session.user.showTypingIndicator = token.showTypingIndicator;
        session.user.showReadReceipts = token.showReadReceipts;
        session.user.preferences = token.preferences;
        session.user.emailPreferences = token.emailPreferences;
        session.user.notificationPreferences = token.notificationPreferences;
        session.user.isEmailVerified = token.isEmailVerified;
      }
      return session;
    },
  },
});
