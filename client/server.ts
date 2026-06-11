import dotenv from "dotenv";
dotenv.config();

import { createServer } from "node:http";
import next from "next";
import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { processMessage } from "@/lib/chat-service";
import { translateText } from "@/lib/ai";
import connectDB from "@/lib/db";
import { setIO } from "@/lib/socket-io";
import { startScheduler } from "@/lib/message-scheduler";
import UserStatus from "@/models/UserStatus";
import User from "@/models/User";
import Chat from "@/models/Chat";
import Friendship from "@/models/Friendship";
import { isBlocked } from "@/lib/block-check";

interface ExtendedSocket extends Socket {
  userId?: string;
}

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  setIO(io);
  startScheduler(io);

  // Redis Adapter setup (optional but recommended for production)
  if (process.env.REDIS_URL) {
    const pubClient = new Redis(process.env.REDIS_URL, {
      lazyConnect: true, // Don't connect immediately
      retryStrategy: (times) => {
        if (times > 3) return null; // Stop retrying after 3 attempts to avoid spam
        return Math.min(times * 50, 2000);
      },
      maxRetriesPerRequest: 3, // Fail fast if connection is bad
    });

    // Attach error handler immediately to prevent crashes from unhandled error events
    pubClient.on("error", (err) => {
      // We log this but don't let it crash the server
      // console.error('Redis Pub Client Error:', err.message);
    });

    try {
      await pubClient.connect();
      const subClient = pubClient.duplicate();

      // Handle errors on subClient
      subClient.on("error", (err) => {
        // console.error('Redis Sub Client Error:', err.message);
      });

      io.adapter(createAdapter(pubClient, subClient));
      console.log("Redis adapter initialized successfully");
    } catch (error) {
      console.warn(
        "Failed to connect to Redis, falling back to in-memory adapter.",
      );
      // Ensure we don't leave hanging handles
      pubClient.disconnect();
    }
  }

  io.on("connection", (socket: ExtendedSocket) => {
    console.log("Client connected:", socket.id);

    socket.on("set_online", async (userId) => {
      socket.userId = userId;
      try {
        await connectDB();
        await UserStatus.findOneAndUpdate(
          { userId },
          { isOnline: true, lastSeen: new Date() },
          { upsert: true }
        );
        const user = await User.findById(userId).select("showLastSeen").lean();
        const showLastSeen = user?.showLastSeen ?? true;
        io.emit("user_online", { userId, isOnline: true });
        io.emit("user_status_change", { userId, isOnline: true, lastSeen: new Date(), showLastSeen });
      } catch (error) {
        console.error("Error setting online status:", error);
      }
    });

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      io.to(chatId).emit("user_typing", { userId: socket.userId, chatId, isTyping: true });
    });

    socket.on("join_user", (userId) => {
      socket.join(userId);
      console.log(`User ${socket.id} joined user room ${userId}`);
    });

    socket.on("send_message", async (message, callback) => {
      // message: { chatId, text, senderId, receiverId }
      try {
        const sId =
          typeof message.senderId === "object"
            ? message.senderId._id
            : message.senderId;
        const rId =
          typeof message.receiverId === "object"
            ? message.receiverId._id
            : message.receiverId;

        const blocked = await isBlocked(sId, rId);
        if (blocked) {
          if (callback)
            callback({ status: "error", error: "You cannot send messages to this user" });
          return;
        }

        const areFriends = await Friendship.findOne({
          $or: [
            { requester: sId, recipient: rId, status: "accepted" },
            { requester: rId, recipient: sId, status: "accepted" },
          ],
        });
        if (!areFriends) {
          if (callback)
            callback({ status: "error", error: "You must be friends to send messages" });
          return;
        }

        let processedMessage;

        // If message has _id, it's likely already processed/saved (e.g. via voice API)
        if (message._id) {
          processedMessage = message;
        } else {
          processedMessage = await processMessage({
            senderId: message.senderId,
            receiverId: message.receiverId,
            text: message.text,
            chatId: message.chatId,
            replyTo: message.replyToId,
          });
        }

        // Auto-translate if the chat has alwaysTranslate enabled
        try {
          const chatRecord = await Chat.findById(message.chatId);
          if (chatRecord?.alwaysTranslate && chatRecord?.autoTranslateLanguage) {
            const rawText = processedMessage.originalText || processedMessage.text || "";
            if (rawText) {
              const autoTranslation = await translateText(rawText, chatRecord.autoTranslateLanguage);
              processedMessage.translatedText = autoTranslation;
              processedMessage.languageTo = chatRecord.autoTranslateLanguage;
            }
          }
        } catch (err) {
          console.error("Auto-translate error:", err);
        }

        // Emit to the room (including sender so they get the confirmed/translated message)
        io.to(message.chatId).emit("receive_message", processedMessage);

        // Also emit new_message event for sidebar updates via user rooms
        io.to(rId).emit("new_message", processedMessage);
        io.to(sId).emit("new_message", processedMessage);

        if (callback) callback({ status: "ok", data: processedMessage });
      } catch (error) {
        console.error("Error processing message:", error);
        if (callback)
          callback({ status: "error", error: "Failed to process message" });
      }
    });

    socket.on("typing", async ({ chatId, userId }) => {
      try {
        const user = await User.findById(userId).select("showTypingIndicator").lean();
        const showTypingIndicator = user?.showTypingIndicator ?? true;
        if (showTypingIndicator) {
          socket.to(chatId).emit("typing", { chatId, userId });
        }
      } catch (error) {
        console.error("Error checking typing indicator preference:", error);
      }
    });

    socket.on("edit_message", ({ chatId, message }) => {
      io.to(chatId).emit("message_edited", message);
    });

    socket.on("delete_message", ({ chatId, messageId }) => {
      io.to(chatId).emit("message_deleted", { messageId, chatId });
    });

    socket.on("messages_read", async ({ chatId, messageIds, userId }) => {
      try {
        const user = await User.findById(userId).select("showReadReceipts").lean();
        const showReadReceipts = user?.showReadReceipts ?? true;
        if (showReadReceipts) {
          socket.to(chatId).emit("messages_read", { messageIds, userId });
        }
      } catch (error) {
        console.error("Error checking read receipts preference:", error);
      }
    });

    // WebRTC call signaling
    socket.on("call_user", ({ targetUserId, callerName, signalData }, callback) => {
      const room = io.sockets.adapter.rooms.get(targetUserId);
      if (!room || room.size === 0) {
        if (callback) callback({ status: "offline" });
        return;
      }
      io.to(targetUserId).emit("incoming_call", {
        from: socket.userId,
        callerName,
        signalData,
      });
      if (callback) callback({ status: "ok" });
    });

    socket.on("call_accepted", ({ callerId, signalData }) => {
      io.to(callerId).emit("call_accepted", { signalData });
    });

    socket.on("call_rejected", ({ callerId }) => {
      io.to(callerId).emit("call_rejected");
    });

    socket.on("call_ended", ({ targetUserId }) => {
      io.to(targetUserId).emit("call_ended");
    });

    socket.on("call_mute", ({ targetUserId, muted }) => {
      io.to(targetUserId).emit("call_mute", { muted });
    });

    socket.on("call_ice_candidate", ({ targetUserId, candidate }) => {
      io.to(targetUserId).emit("call_ice_candidate", { candidate });
    });

    socket.on("disconnect", async () => {
      console.log("Client disconnected:", socket.id);
      if (socket.userId) {
        try {
          await connectDB();
          await UserStatus.findOneAndUpdate(
            { userId: socket.userId },
            { isOnline: false, lastSeen: new Date() }
          );
          const user = await User.findById(socket.userId).select("showLastSeen").lean();
          const showLastSeen = user?.showLastSeen ?? true;
          io.emit("user_online", { userId: socket.userId, isOnline: false });
          io.emit("user_status_change", { userId: socket.userId, isOnline: false, lastSeen: new Date(), showLastSeen });
        } catch (error) {
          console.error("Error updating offline status:", error);
        }
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
