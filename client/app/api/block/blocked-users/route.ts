import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Block from "@/models/Block";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const blocks = await Block.find({ blocker: session.user.id })
      .populate("blocked", "_id name avatar bio preferredLanguage")
      .lean();

    return NextResponse.json(blocks);
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
