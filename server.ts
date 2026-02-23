import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config(); // Also try loading .env if it exists

import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { processMessage } from "@/lib/chat-service";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
  });

  // Redis Adapter setup (optional but recommended for production)
  if (process.env.REDIS_URL) {
      const pubClient = new Redis(process.env.REDIS_URL, {
        lazyConnect: true, // Don't connect immediately
        retryStrategy: (times) => {
            if (times > 3) return null; // Stop retrying after 3 attempts to avoid spam
            return Math.min(times * 50, 2000);
        },
        maxRetriesPerRequest: 3 // Fail fast if connection is bad
      });

      // Attach error handler immediately to prevent crashes from unhandled error events
      pubClient.on('error', (err) => {
        // We log this but don't let it crash the server
        // console.error('Redis Pub Client Error:', err.message);
      });
      
      try {
          await pubClient.connect();
          const subClient = pubClient.duplicate();
          
          // Handle errors on subClient
          subClient.on('error', (err) => {
              // console.error('Redis Sub Client Error:', err.message);
          });

          io.adapter(createAdapter(pubClient, subClient));
          console.log("Redis adapter initialized successfully");
      } catch (error) {
          console.warn("Failed to connect to Redis, falling back to in-memory adapter.");
          // Ensure we don't leave hanging handles
          pubClient.disconnect();
      }
  }

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    socket.on("join_user", (userId) => {
        socket.join(userId);
        console.log(`User ${socket.id} joined user room ${userId}`);
    });

    socket.on("send_message", async (message, callback) => {
      // message: { chatId, text, senderId, receiverId }
      try {
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
            });
        }

        // Emit to the room (including sender so they get the confirmed/translated message)
        io.to(message.chatId).emit("receive_message", processedMessage);
        
        // Also emit new_message event for sidebar updates via user rooms
        const sId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
        const rId = typeof message.receiverId === 'object' ? message.receiverId._id : message.receiverId;
        
        io.to(rId).emit("new_message", processedMessage);
        io.to(sId).emit("new_message", processedMessage);

        if (callback) callback({ status: "ok", data: processedMessage });
      } catch (error) {
        console.error("Error processing message:", error);
        if (callback) callback({ status: "error", error: "Failed to process message" });
      }
    });
    
    socket.on("typing", ({ chatId, userId }) => {
        socket.to(chatId).emit("typing", { chatId, userId });
    });

    socket.on("delete_message", ({ chatId, messageId }) => {
        io.to(chatId).emit("message_deleted", { messageId, chatId });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
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
