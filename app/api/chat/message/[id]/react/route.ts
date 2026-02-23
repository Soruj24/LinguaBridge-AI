import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Message from "@/models/Message";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { emoji } = await req.json();

    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 });
    }

    await connectDB();

    const message = await Message.findById(id);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Get user ID safely
    const userId = session.user.id;
    if (!userId) {
       return NextResponse.json({ error: "User ID missing" }, { status: 400 });
    }

    // Check if user already reacted with this emoji
    // Note: reactions might be undefined if it's a new field on old doc, so default to empty array
    if (!message.reactions) message.reactions = [];
    
    const existingReactionIndex = message.reactions.findIndex(
      (r: any) => r.emoji === emoji && r.userId.toString() === userId
    );

    let action = "added";

    if (existingReactionIndex > -1) {
      // Remove reaction
      message.reactions.splice(existingReactionIndex, 1);
      action = "removed";
    } else {
      // Add reaction
      message.reactions.push({ emoji, userId });
    }

    await message.save();

    return NextResponse.json({ 
      success: true, 
      action,
      reactions: message.reactions 
    });

  } catch (error) {
    console.error("Reaction error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
