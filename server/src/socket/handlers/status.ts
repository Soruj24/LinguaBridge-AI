import { Server, Socket } from "socket.io";
import connectDB from "../../config/connectDB";
import { UserStatus, ChatUser } from "../../models/chat";

interface ExtendedSocket extends Socket {
  userId?: string;
}

export function handleSetOnline(io: Server, socket: ExtendedSocket) {
  socket.on("set_online", async (userId) => {
    socket.userId = userId;
    try {
      await connectDB();
      await UserStatus.findOneAndUpdate(
        { userId },
        { isOnline: true, lastSeen: new Date() },
        { upsert: true }
      );
      const user = await ChatUser.findById(userId).select("showLastSeen").lean();
      const showLastSeen = user?.showLastSeen ?? true;
      io.emit("user_online", { userId, isOnline: true });
      io.emit("user_status_change", { userId, isOnline: true, lastSeen: new Date(), showLastSeen });
    } catch (error) {
      console.error("Error setting online status:", error);
    }
  });
}

export function handleDisconnect(io: Server, socket: ExtendedSocket) {
  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);
    if (socket.userId) {
      try {
        await connectDB();
        await UserStatus.findOneAndUpdate(
          { userId: socket.userId },
          { isOnline: false, lastSeen: new Date() }
        );
        const user = await ChatUser.findById(socket.userId).select("showLastSeen").lean();
        const showLastSeen = user?.showLastSeen ?? true;
        io.emit("user_online", { userId: socket.userId, isOnline: false });
        io.emit("user_status_change", { userId: socket.userId, isOnline: false, lastSeen: new Date(), showLastSeen });
      } catch (error) {
        console.error("Error updating offline status:", error);
      }
    }
  });
}
