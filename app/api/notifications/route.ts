import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      userId: session.user.id,
      isRead: false,
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");
    const markAllRead = searchParams.get("all");

    if (markAllRead === "true") {
      await Notification.updateMany(
        { userId: session.user.id, isRead: false },
        { $set: { isRead: true } }
      );
      return NextResponse.json({ message: "All notifications marked as read" });
    }

    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId: session.user.id },
        { $set: { isRead: true } }
      );
      return NextResponse.json({ message: "Notification marked as read" });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}