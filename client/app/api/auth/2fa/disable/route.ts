import { NextResponse } from "next/server";
import { auth } from "@/auth";
import speakeasy from "speakeasy";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { password, token } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is not enabled" },
        { status: 400 }
      );
    }

    if (user.password) {
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (!passwordsMatch) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 400 }
        );
      }
    }

    if (token) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret!,
        encoding: "base32",
        token,
      });

      if (!verified) {
        if (user.twoFactorRecoveryCodes?.includes(token.toUpperCase())) {
          user.twoFactorRecoveryCodes = user.twoFactorRecoveryCodes.filter(
            (code: string) => code !== token.toUpperCase()
          );
          await user.save();
        } else {
          return NextResponse.json(
            { error: "Invalid 2FA code" },
            { status: 400 }
          );
        }
      }
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorRecoveryCodes = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "2FA has been disabled",
    });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json(
      { error: "Failed to disable 2FA" },
      { status: 500 }
    );
  }
}