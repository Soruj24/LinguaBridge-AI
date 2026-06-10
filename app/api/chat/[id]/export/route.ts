import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";
import Message from "@/models/Message";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    if (format !== "json" && format !== "txt") {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    await connectDB();

    const chat = await Chat.findById(id).populate(
      "participants",
      "name email avatar preferredLanguage",
    );
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const isParticipant = chat.participants.some(
      (p: { email: string }) => p.email === session.user!.email,
    );
    if (!isParticipant && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await Message.find({ chatId: id, isDeleted: false })
      .sort({ createdAt: 1 })
      .populate("senderId", "name email avatar")
      .populate("receiverId", "name email avatar");

    if (format === "txt") {
      const otherParticipant = chat.participants.find(
        (p: { email: string }) => p.email !== session.user?.email,
      );
      const chatName = chat.groupName || otherParticipant?.name || "Chat";
      const date = new Date().toLocaleDateString(undefined, {
        year: "numeric", month: "long", day: "numeric",
      });

      const lines = messages.map((msg: Record<string, unknown>) => {
        const sender = msg.senderId as { name?: string } | null;
        const senderName = sender?.name || "Unknown";
        const timestamp = new Date(msg.createdAt as string).toLocaleString();
        const text = (msg.originalText as string) || "";
        return `[${timestamp}] ${senderName}: ${text}`;
      });

      const content = [
        `Chat Export - ${chatName}`,
        `Date: ${date}`,
        `---`,
        ...lines,
      ].join("\n");

      return new NextResponse(content, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="chat-${id}.txt"`,
        },
      });
    }

    return NextResponse.json(
      { chat, messages },
      {
        status: 200,
        headers: {
          "Content-Disposition": `attachment; filename="chat-${id}.json"`,
        },
      },
    );
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
