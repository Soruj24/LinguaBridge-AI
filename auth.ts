import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { authConfig } from "./auth.config";
import connectDB from "./lib/db";
import User from "./models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION } from "./lib/email-templates";
import LoginActivity from "./models/LoginActivity";
import { parseUserAgent } from "./lib/user-agent";

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

async function getOrCreateUser({
  email,
  name,
  image,
  provider,
}: {
  email: string;
  name?: string | null;
  image?: string | null;
  provider: "google" | "github";
}) {
  await connectDB();
  
  let user = await User.findOne({ email });
  
  if (!user) {
    user = await User.create({
      name: name || "User",
      email,
      avatar: image,
      isEmailVerified: true,
      isActive: true,
      loginAttempts: 0,
    });
  } else {
    if (image && !user.avatar) {
      user.avatar = image;
      await user.save();
    }
  }
  
  return user;
}

async function logLoginActivity({
  userId,
  email,
  userAgent,
  type,
  success,
  failureReason,
  provider,
}: {
  userId?: string;
  email: string;
  userAgent?: string;
  type: "login" | "logout" | "signup" | "password_change" | "2fa_enabled" | "2fa_disabled";
  success: boolean;
  failureReason?: string;
  provider?: string;
}) {
  try {
    await connectDB();
    
    const deviceInfo = userAgent 
      ? parseUserAgent(userAgent)
      : { deviceType: "unknown" as const, browser: "Unknown", os: "Unknown" };

    await LoginActivity.create({
      userId,
      email,
      userAgent,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      type,
      success,
      failureReason,
      provider,
    });
  } catch (error) {
    console.error("Failed to log login activity:", error);
  }
}

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
        const userAgent = req?.headers?.get("user-agent");
        
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          
          if (!user) {
            await logLoginActivity({
              email,
              userAgent: userAgent || undefined,
              type: "login",
              success: false,
              failureReason: "User not found",
              provider: "credentials",
            });
            return null;
          }

          if (user.isActive === false) {
            await logLoginActivity({
              userId: user._id.toString(),
              email,
              userAgent: userAgent || undefined,
              type: "login",
              success: false,
              failureReason: "Account disabled",
              provider: "credentials",
            });
            return null;
          }

          const lockUntil = user.lockUntil;
          const isLocked = lockUntil && new Date() < lockUntil;
          if (isLocked) {
            await logLoginActivity({
              userId: user._id.toString(),
              email,
              userAgent: userAgent || undefined,
              type: "login",
              success: false,
              failureReason: "Account locked",
              provider: "credentials",
            });
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) {
            const attempts = (user.loginAttempts || 0) + 1;
            const updateData: Record<string, unknown> = { loginAttempts: attempts };
            
            if (attempts >= MAX_LOGIN_ATTEMPTS) {
              updateData.lockUntil = new Date(Date.now() + LOCKOUT_DURATION);
              updateData.loginAttempts = attempts;
            }
            
            await User.updateOne({ _id: user._id }, updateData);
            
            await logLoginActivity({
              userId: user._id.toString(),
              email,
              userAgent: userAgent || undefined,
              type: "login",
              success: false,
              failureReason: `Invalid password (attempt ${attempts}/${MAX_LOGIN_ATTEMPTS})`,
              provider: "credentials",
            });
            
            return null;
          }

          user.loginAttempts = 0;
          user.lockUntil = undefined;
          user.lastLogin = new Date();
          await user.save();

          await logLoginActivity({
            userId: user._id.toString(),
            email,
            userAgent: userAgent || undefined,
            type: "login",
            success: true,
            provider: "credentials",
          });

          return user;
        }

        return null;
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
            provider: account.provider as "google" | "github",
          });
          
          user._id = authUser._id.toString();
          user.role = authUser.role;
          user.preferredLanguage = authUser.preferredLanguage;
          user.avatar = authUser.avatar;

          await logLoginActivity({
            userId: authUser._id.toString(),
            email: user.email!,
            userAgent: undefined,
            type: "login",
            success: true,
            provider: account.provider,
          });
        } catch (error) {
          console.error("Error in signIn event:", error);
        }
      }
    },
    async signOut() {
      // Session cleanup handled in middleware
    },
  },
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
      account,
    }: {
      token: import("next-auth/jwt").JWT;
      user: import("next-auth").User | import("next-auth/adapters").AdapterUser;
      trigger?: "signIn" | "signUp" | "update";
      session?: {
        preferredLanguage?: string;
        avatar?: string;
        user?: {
          preferences?: {
            lowBandwidth: boolean;
            reduceMotion: boolean;
            highContrast: boolean;
            autoPlayAudio: boolean;
          };
        };
      };
      account?: { provider?: string } | null;
    }) {
      if (user) {
        const typedUser = user as {
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
        
        token.id = String((typedUser._id as string)?.toString() || typedUser.id || "");
        token.role = ((typedUser.role as "user" | "admin") ?? "user") as
          | "user"
          | "admin";
        token.preferredLanguage = (typedUser.preferredLanguage as string) || "en";
        token.avatar = typedUser.avatar as string || undefined;
        token.isEmailVerified = (typedUser.isEmailVerified as boolean) || false;
        token.preferences = typedUser.preferences as {
          lowBandwidth: boolean;
          reduceMotion: boolean;
          highContrast: boolean;
          autoPlayAudio: boolean;
        };
      }

      if (trigger === "update" && session) {
        token.preferredLanguage = session.preferredLanguage;
        token.avatar = session.avatar;
        if (session.user?.preferences) {
          token.preferences = (
            session as {
              user?: {
                preferences?: {
                  lowBandwidth: boolean;
                  reduceMotion: boolean;
                  highContrast: boolean;
                  autoPlayAudio: boolean;
                };
              };
            }
          ).user?.preferences as {
            lowBandwidth: boolean;
            reduceMotion: boolean;
            highContrast: boolean;
            autoPlayAudio: boolean;
          };
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
        session.user.role =
          (token.role as "user" | "admin" | undefined) ?? "user";
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