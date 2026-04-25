import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { PASSWORD_RESET_EXPIRY, generatePasswordResetToken, getPasswordResetTemplate } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotSchema.parse(body);

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "If that email exists, a reset link has been sent." },
        { status: 200 }
      );
    }

    const token = generatePasswordResetToken();
    const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY);

    user.passwordResetToken = token;
    user.passwordResetExpires = expires;
    await user.save();

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const template = getPasswordResetTemplate(user.name, token, baseUrl);

    await sendEmail({
      to: user.email,
      ...template,
    });

    return NextResponse.json(
      { message: "Password reset email sent if account exists." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}