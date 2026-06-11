import http from "http";
import { Server } from "socket.io";

import { connectDatabase } from "./config/db";
import app from "./app";
import { PORT } from "./secret";
import { userManager } from "./socket/utils/userManager";

const server = http.createServer(app);
 
export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔗 New connection: ${socket.id}`);

  // User joins a personal room for notifications
  socket.on('join', (userId: string) => {
    if (userId) {
      socket.join(userId);
      console.log(`👤 User joined room: ${userId}`);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Connection closed: ${socket.id}`, reason);

    const userData = userManager.get(socket.id);
    if (userData) {
      userManager.delete(socket.id);
      console.log(`📝 Removed ${userData.username} from connected users`);

      // Update online users list
      const onlineUsers = userManager.getAllUsernames();
      io.emit('users-update', {
        users: onlineUsers,
        onlineUsers: onlineUsers
      });
    }
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});
connectDatabase()
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`
  ));