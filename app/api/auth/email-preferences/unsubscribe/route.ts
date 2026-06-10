import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";

function verifyUnsubscribeToken(email: string, token: string): boolean {
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret";
  const expected = crypto.createHmac("sha256", secret).update(email).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const type = searchParams.get("type") || "marketing";

    if (!token || !email) {
      return new Response(
        `<html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h1>Invalid unsubscribe link</h1>
          <p>This unsubscribe link is invalid or expired.</p>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    const isValid = verifyUnsubscribeToken(email, token);
    if (!isValid) {
      return new Response(
        `<html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h1>Invalid unsubscribe link</h1>
          <p>This unsubscribe link is invalid or expired.</p>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return new Response(
        `<html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h1>Email not found</h1>
          <p>We couldn't find an account with this email address.</p>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    if (type === "all") {
      user.emailPreferences = { marketing: false, security: false };
    } else if (type === "marketing") {
      user.emailPreferences = { ...user.emailPreferences, marketing: false };
    } else if (type === "security") {
      user.emailPreferences = { ...user.emailPreferences, security: false };
    }

    await user.save();

    return new Response(
      `<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; text-align: center; background: #f5f5f5;">
        <div style="max-width: 480px; margin: 40px auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h1 style="font-size: 24px; color: #1a1a1a; margin: 0 0 16px;">Unsubscribed Successfully</h1>
          <p style="color: #666; line-height: 1.6; margin: 0 0 24px;">
            You've been unsubscribed from ${type === "all" ? "all" : type} email notifications.
          </p>
          <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 0;">
            You can manage your email preferences anytime in your account settings.
          </p>
        </div>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return new Response(
      `<html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h1>Something went wrong</h1>
        <p>Please try again later.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
