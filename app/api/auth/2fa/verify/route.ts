import { NextResponse } from "next/server";
import { auth } from "@/auth";
import speakeasy from "speakeasy";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/User";

function generateRecoveryCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    codes.push(crypto.randomBytes(4).toString("hex").toUpperCase());
  }
  return codes;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { token, secret } = body;

    if (!token || !secret) {
      return NextResponse.json(
        { error: "Token and secret are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is already enabled" },
        { status: 400 }
      );
    }

    const verified = speakeasy.totp.verify({
      secret: secret || user.twoFactorSecret!,
      encoding: "base32",
      token,
    });

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    const recoveryCodes = generateRecoveryCodes();

    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret || user.twoFactorSecret;
    user.twoFactorRecoveryCodes = recoveryCodes;
    await user.save();

    return NextResponse.json({
      success: true,
      recoveryCodes,
    });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    );
  }
}