import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Folder from "@/models/Folder";
import Chat from "@/models/Chat";
import User from "@/models/User";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.email) return null;
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  return user?._id;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await req.json();
    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    const folder = await Folder.findOne({ _id: id, userId });
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (!folder.chatIds.includes(chatId)) {
      folder.chatIds.push(chatId);
      await folder.save();
    }

    await Chat.findByIdAndUpdate(chatId, { $set: { folderId: id } });

    return NextResponse.json({ folder });
  } catch (error) {
    console.error("Error adding chat to folder:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await req.json();
    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    const folder = await Folder.findOne({ _id: id, userId });
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    folder.chatIds = folder.chatIds.filter((cId: string) => cId.toString() !== chatId);
    await folder.save();

    await Chat.findByIdAndUpdate(chatId, { $set: { folderId: null } });

    return NextResponse.json({ folder });
  } catch (error) {
    console.error("Error removing chat from folder:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
