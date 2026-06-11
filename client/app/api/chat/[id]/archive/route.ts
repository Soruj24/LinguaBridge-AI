import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { action } = await req.json();

    if (action !== "archive" && action !== "unarchive") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connectDB();

    const chat = await Chat.findById(id);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const isParticipant = chat.participants.some(
      (p: { _id: { toString: () => string } }) =>
        p._id.toString() === session.user?.id,
    );
    if (!isParticipant && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "archive") {
      chat.isArchived = true;
      chat.archivedAt = new Date();
    } else {
      chat.isArchived = false;
      chat.archivedAt = null;
    }

    await chat.save();

    return NextResponse.json({ success: true, chat });
  } catch (error) {
    console.error("Error archiving chat:", error);
    return NextResponse.json(
      { error: "Failed to archive chat" },
      { status: 500 },
    );
  }
}
