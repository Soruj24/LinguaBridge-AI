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
          preferences?: {
            lowBandwidth: boolean;
            reduceMotion: boolean;
            highContrast: boolean;
            autoPlayAudio: boolean;
          };
        };

        token.id = String(u._id?.toString() || u.id || "");
        token.role = (u.role ?? "user") as "user" | "admin";
        token.preferredLanguage = u.preferredLanguage || "en";
        token.avatar = u.avatar || undefined;
        token.isEmailVerified = u.isEmailVerified || false;
        token.preferences = u.preferences;
      }

      if (trigger === "update" && session) {
        token.preferredLanguage = session.preferredLanguage;
        token.avatar = session.avatar;
        if (session.user?.preferences) {
          token.preferences = session.user.preferences;
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
        session.user.preferences = token.preferences;
        session.user.isEmailVerified = token.isEmailVerified;
      }
      return session;
    },
  },
});
