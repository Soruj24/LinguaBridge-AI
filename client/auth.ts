import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

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
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${SERVER_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (!res.ok || !data?.payload?.user) return null;

          const user = data.payload.user;
          return {
            id: user._id || user.id,
            email: user.email,
            name: user.firstName || user.username || user.displayName,
            image: user.avatar?.url || user.avatar || undefined,
            role: user.role || "user",
            preferredLanguage: user.preferredLanguage || "en",
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
          };
        } catch (error) {
          console.error("Auth provider error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (((user as Record<string, unknown>).role as string) || "user") as "user" | "admin";
        token.preferredLanguage = ((user as Record<string, unknown>).preferredLanguage as string) || "en";
        token.avatar = user.image || undefined;
        token.accessToken = ((user as Record<string, unknown>).accessToken as string) || undefined;
        token.refreshToken = ((user as Record<string, unknown>).refreshToken as string) || undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "user" | "admin") || "user";
        session.user.preferredLanguage = token.preferredLanguage as string;
        session.user.avatar = token.avatar as string;
        session.user.image = (token.avatar as string) || session.user.image;
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
      }
      return session;
    },
  },
});
