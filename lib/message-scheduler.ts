import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Chat from "@/models/Chat";
import Notification from "@/models/Notification";
import { Server } from "socket.io";

let intervalRef: NodeJS.Timeout | null = null;

export async function checkAndSendScheduledMessages(io: Server) {
  try {
    await connectDB();

    const now = new Date();
    const messages = await Message.find({
      status: "scheduled",
      scheduledAt: { $lte: now },
    })
      .populate("senderId", "name email avatar")
      .populate("receiverId", "name email avatar")
      .populate({
        path: "replyTo",
        populate: { path: "senderId", select: "name" },
      });

    if (messages.length === 0) return;

    for (const message of messages) {
      try {
        message.status = "sent";
        await message.save();

        await Chat.findByIdAndUpdate(message.chatId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        await Notification.create({
          userId: message.receiverId._id,
          type: "message",
          title: "New message",
          message: `${message.senderId.name}: ${message.originalText}`,
          link: `/dashboard?chat=${message.chatId}`,
        });

        const msgObj = message.toObject();
        io.to(message.chatId.toString()).emit("receive_message", msgObj);
        io.to(message.receiverId._id.toString()).emit("new_message", msgObj);
        io.to(message.senderId._id.toString()).emit("new_message", msgObj);
      } catch (err) {
        console.error("Failed to send scheduled message:", message._id, err);
        message.status = "failed";
        await message.save();
      }
    }
  } catch (error) {
    console.error("Scheduler check failed:", error);
  }
}

export function startScheduler(io: Server) {
  if (intervalRef) return;
  console.log("Message scheduler started (interval: 10s)");
  intervalRef = setInterval(() => {
    checkAndSendScheduledMessages(io);
  }, 10000);
}

export function stopScheduler() {
  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
    console.log("Message scheduler stopped");
  }
}
