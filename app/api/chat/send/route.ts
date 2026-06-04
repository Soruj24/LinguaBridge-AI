import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Friendship from "@/models/Friendship";
import { processMessage } from "@/lib/chat-service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, receiverId, text, voiceUrl } = await req.json();

    if (!text || !receiverId || !chatId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const areFriends = await Friendship.findOne({
      $or: [
        { requester: currentUser._id, recipient: receiverId, status: "accepted" },
        { requester: receiverId, recipient: currentUser._id, status: "accepted" },
      ],
    });
    if (!areFriends) {
      return NextResponse.json(
        { error: "You must be friends to send messages" },
        { status: 403 }
      );
    }

    const message = await processMessage({
      senderId: session.user.id,
      receiverId,
      text,
      chatId,
      voiceUrl,
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
