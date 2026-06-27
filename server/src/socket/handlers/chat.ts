import { Server, Socket } from "socket.io";
import connectDB from "../../config/connectDB";
import { ChatUser, Chat, Friendship } from "../../models/chat";
import { processMessage } from "../../services/chatService";
import { translateText } from "../../services/ai/translation";
import { isBlocked } from "../../utils/blockCheck";

interface ExtendedSocket extends Socket {
  userId?: string;
}

export function handleJoinChat(io: Server, socket: ExtendedSocket) {
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    io.to(chatId).emit("user_typing", { userId: socket.userId, chatId, isTyping: true });
  });
}

export function handleJoinUser(io: Server, socket: ExtendedSocket) {
  socket.on("join_user", (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined user room ${userId}`);
  });
}

export function handleSendMessage(io: Server, socket: ExtendedSocket) {
  socket.on("send_message", async (message, callback) => {
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

      io.to(message.chatId).emit("receive_message", processedMessage);
      io.to(rId).emit("new_message", processedMessage);
      io.to(sId).emit("new_message", processedMessage);

      if (callback) callback({ status: "ok", data: processedMessage });
    } catch (error) {
      console.error("Error processing message:", error);
      if (callback)
        callback({ status: "error", error: "Failed to process message" });
    }
  });
}

export function handleTyping(io: Server, socket: ExtendedSocket) {
  socket.on("typing", async ({ chatId, userId }) => {
    try {
      const user = await ChatUser.findById(userId).select("showTypingIndicator").lean();
      const showTypingIndicator = user?.showTypingIndicator ?? true;
      if (showTypingIndicator) {
        socket.to(chatId).emit("typing", { chatId, userId });
      }
    } catch (error) {
      console.error("Error checking typing indicator preference:", error);
    }
  });
}

export function handleEditMessage(io: Server, socket: ExtendedSocket) {
  socket.on("edit_message", ({ chatId, message }) => {
    io.to(chatId).emit("message_edited", message);
  });
}

export function handleDeleteMessage(io: Server, socket: ExtendedSocket) {
  socket.on("delete_message", ({ chatId, messageId }) => {
    io.to(chatId).emit("message_deleted", { messageId, chatId });
  });
}

export function handleMessagesRead(io: Server, socket: ExtendedSocket) {
  socket.on("messages_read", async ({ chatId, messageIds, userId }) => {
    try {
      const user = await ChatUser.findById(userId).select("showReadReceipts").lean();
      const showReadReceipts = user?.showReadReceipts ?? true;
      if (showReadReceipts) {
        socket.to(chatId).emit("messages_read", { messageIds, userId });
      }
    } catch (error) {
      console.error("Error checking read receipts preference:", error);
    }
  });
}
