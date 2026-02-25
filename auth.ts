import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import connectDB from "./lib/db";
import User from "./models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

async function getUser(email: string) {
  try {
    await connectDB();
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;

          if (user.isActive === false) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: Record<string, unknown>;
      user: Record<string, unknown>;
      trigger?: string;
      session?: Record<string, unknown>;
    }) {
      if (user) {
        token.id = (user._id as string).toString();
        token.role = (user.role as string) || "user";
        token.preferredLanguage = user.preferredLanguage as string;
        token.avatar = user.avatar as string;
        token.preferences = user.preferences as Record<string, unknown>;
      }

      // Handle session updates (e.g. from update())
      if (trigger === "update" && session) {
        token.preferredLanguage = session.preferredLanguage;
        token.avatar = session.avatar;
        if (
          (session as { user?: { preferences?: Record<string, unknown> } }).user
            ?.preferences
        ) {
          token.preferences = (
            session as { user?: { preferences?: Record<string, unknown> } }
          ).user?.preferences as Record<string, unknown>;
        }
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: import("next-auth").Session;
      token: import("next-auth/jwt").JWT;
    }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.preferredLanguage = token.preferredLanguage;
        session.user.avatar = token.avatar;
        session.user.image = token.avatar || session.user.image;
        session.user.preferences = token.preferences;
      }
      return session;
    },
  },
});
