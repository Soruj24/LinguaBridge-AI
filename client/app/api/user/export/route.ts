import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import Friendship from "@/models/Friendship";
import Notification from "@/models/Notification";
import PhrasebookEntry from "@/models/Phrasebook";
import Folder from "@/models/Folder";
import Block from "@/models/Block";
import Report from "@/models/Report";
import LoginActivity from "@/models/LoginActivity";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = session.user.id;

    const user = await User.findById(userId).select(
      "-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires -twoFactorSecret -twoFactorRecoveryCodes -loginAttempts -lockUntil"
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [chats, messages, friendships, notifications, phrasebook, folders, blocksMade, reports, loginActivity] =
      await Promise.all([
        Chat.find({ participants: userId })
          .populate("participants", "name email avatar preferredLanguage")
          .populate("lastMessage")
          .lean(),
        Message.find({
          $or: [{ senderId: userId }, { receiverId: userId }],
        }).lean(),
        Friendship.find({
          $or: [{ requester: userId }, { recipient: userId }],
        }).lean(),
        Notification.find({ userId }).lean(),
        PhrasebookEntry.find({ userId }).lean(),
        Folder.find({ userId }).lean(),
        Block.find({ blocker: userId }).populate("blocked", "name email").lean(),
        Report.find({ reporter: userId }).lean(),
        LoginActivity.find({ userId }).sort({ timestamp: -1 }).lean(),
      ]);

    const blocksReceived = await Block.find({ blocked: userId })
      .populate("blocker", "name email")
      .lean();

    const exportData = {
      exportDate: new Date().toISOString(),
      user,
      chats,
      messages,
      friendships,
      notifications,
      phrasebook,
      folders,
      blocks: {
        blockedByMe: blocksMade,
        blockedByOthers: blocksReceived,
      },
      reports,
      loginActivity,
    };

    const filename = `lingualbridge-export-${new Date().toISOString().split("T")[0]}.json`;
    const json = JSON.stringify(exportData, null, 2);

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error("Error exporting data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
