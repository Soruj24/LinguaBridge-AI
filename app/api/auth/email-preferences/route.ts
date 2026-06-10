import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select("emailPreferences");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      emailPreferences: user.emailPreferences || { marketing: true, security: true },
    });
  } catch (error) {
    console.error("Error fetching email preferences:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { marketing, security, token } = body;

    await connectDB();

    if (token) {
      const user = await User.findOne({
        emailVerificationToken: token,
      });
      if (!user) {
        return NextResponse.json({ error: "Invalid unsubscribe token" }, { status: 400 });
      }
      user.emailPreferences = {
        marketing: marketing ?? user.emailPreferences?.marketing ?? true,
        security: security ?? user.emailPreferences?.security ?? true,
      };
      await user.save();
      return NextResponse.json({ message: "Email preferences updated" });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.emailPreferences = {
      marketing: marketing ?? user.emailPreferences?.marketing ?? true,
      security: security ?? user.emailPreferences?.security ?? true,
    };
    await user.save();

    return NextResponse.json({ message: "Email preferences updated", emailPreferences: user.emailPreferences });
  } catch (error) {
    console.error("Error updating email preferences:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
