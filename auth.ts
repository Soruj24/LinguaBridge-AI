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

export const { auth, signIn, signOut, handlers } = (NextAuth as any)({
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

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: { token: any; user: any; trigger?: string; session?: any }) {
      if (user) {
        token.id = user._id?.toString();
        token.preferredLanguage = (user as any).preferredLanguage;
        token.avatar = (user as any).avatar;
        token.preferences = (user as any).preferences;
      }
      
      // Handle session updates (e.g. from update())
      if (trigger === "update" && session) {
        token.preferredLanguage = session.preferredLanguage;
        token.avatar = session.avatar;
        if (session.user?.preferences) {
            token.preferences = session.user.preferences;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.preferredLanguage = token.preferredLanguage;
        session.user.avatar = token.avatar;
        session.user.image = token.avatar || session.user.image;
        session.user.preferences = token.preferences;
      }
      return session;
    },
  },
});
