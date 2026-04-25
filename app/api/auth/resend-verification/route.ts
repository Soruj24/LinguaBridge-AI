import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { generateEmailVerificationToken, getEmailVerificationTemplate, EMAIL_VERIFICATION_EXPIRY } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = resendSchema.parse(body);

    await connectDB();

    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { message: "If that email exists, a verification email has been sent." },
        { status: 200 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: "Email already verified." },
        { status: 400 }
      );
    }

    const token = generateEmailVerificationToken();
    const expires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY);

    user.emailVerificationToken = token;
    user.emailVerificationExpires = expires;
    await user.save();

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const template = getEmailVerificationTemplate(user.name, token, baseUrl);

    await sendEmail({
      to: user.email,
      ...template,
    });

    return NextResponse.json(
      { message: "Verification email sent if account exists." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}