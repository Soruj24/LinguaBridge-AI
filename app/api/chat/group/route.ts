import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";
import User from "@/models/User";
import mongoose from "mongoose";
import Message from "@/models/Message";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const groupName = formData.get("groupName") as string;
    const participantIds = formData.getAll("participantIds") as string[];
    const groupDescription = formData.get("groupDescription") as string;

    if (!groupName || !participantIds || participantIds.length === 0) {
      return NextResponse.json(
        { error: "Group name and at least one participant required" },
        { status: 400 }
      );
    }

    await connectDB();

    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const allParticipants = [session.user.id, ...participantIds];

    const newGroup = await Chat.create({
      participants: allParticipants,
      isGroup: true,
      groupName,
      groupDescription: groupDescription || "",
      groupAdmin: session.user.id,
    });

    const populatedGroup = await Chat.findById(newGroup._id).populate(
      "participants",
      "name email avatar preferredLanguage"
    );

    return NextResponse.json(populatedGroup);
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, participantId, action } = await req.json();

    await connectDB();

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (!chat.isGroup) {
      return NextResponse.json({ error: "Not a group chat" }, { status: 400 });
    }

    if (chat.groupAdmin.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only admin can add/remove members" }, { status: 403 });
    }

    if (action === "add") {
      if (!chat.participants.includes(participantId)) {
        chat.participants.push(participantId);
        await chat.save();
      }
    } else if (action === "remove") {
      const participantStr = participantId.toString();
      chat.participants = chat.participants.filter(
        (p: mongoose.Types.ObjectId) => p.toString() !== participantStr
      );
      await chat.save();
    }

    const updatedChat = await Chat.findById(chatId).populate(
      "participants",
      "name email avatar preferredLanguage"
    );

    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}