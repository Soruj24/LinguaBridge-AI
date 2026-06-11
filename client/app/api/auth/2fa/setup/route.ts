import { NextResponse } from "next/server";
import { auth } from "@/auth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const secret = speakeasy.generateSecret({
      name: `LinguaBridge AI (${user.email})`,
      length: 20,
    });

    const otpauthUrl = secret.otpauth_url!;
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    user.twoFactorSecret = secret.base32;
    await user.save();

    return NextResponse.json({
      qrCode: qrCodeUrl,
      secret: secret.base32,
      otpauthUrl,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      enabled: user.twoFactorEnabled || false,
    });
  } catch (error) {
    console.error("2FA status error:", error);
    return NextResponse.json(
      { error: "Failed to get 2FA status" },
      { status: 500 }
    );
  }
}