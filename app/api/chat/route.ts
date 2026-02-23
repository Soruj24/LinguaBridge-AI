import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";
import User from "@/models/User";
import Message from "@/models/Message";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const currentUser = await User.findOne({ email: session.user.email });

    const chats = await Chat.find({
      participants: currentUser._id,
    })
      .populate("participants", "name email avatar preferredLanguage")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId } = await req.json();
    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const currentUser = await User.findOne({ email: session.user.email });

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [currentUser._id, receiverId] },
    }).populate("participants", "name email avatar preferredLanguage");

    if (existingChat) {
      return NextResponse.json(existingChat);
    }

    const newChat = await Chat.create({
      participants: [currentUser._id, receiverId],
    });

    const populatedChat = await Chat.findById(newChat._id).populate(
      "participants",
      "name email avatar preferredLanguage"
    );

    return NextResponse.json(populatedChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
