
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { rewriteText } from "@/lib/ai";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, tone } = await req.json();
    if (!text || !tone) {
      return NextResponse.json({ error: "Missing text or tone" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    const preferredLanguage = user?.preferredLanguage || "en";

    const rewritten = await rewriteText(text, tone, preferredLanguage);

    return NextResponse.json({ rewritten });
  } catch (error) {
    console.error("Rewrite error:", error);
    return NextResponse.json({ error: "Failed to rewrite text" }, { status: 500 });
  }
}
