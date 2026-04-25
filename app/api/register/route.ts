import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { z, ZodError } from "zod";
import { generateEmailVerificationToken, getEmailVerificationTemplate, EMAIL_VERIFICATION_EXPIRY } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  preferredLanguage: z.string().default("en"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, preferredLanguage } =
      registerSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = generateEmailVerificationToken();
    const verificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      preferredLanguage,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false,
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const template = getEmailVerificationTemplate(name, verificationToken, baseUrl);

    try {
      await sendEmail({
        to: email,
        ...template,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    return NextResponse.json(
      {
        message: "Account created successfully. Please check your email to verify your account.",
        user: { id: user._id, name: user.name, email: user.email },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}