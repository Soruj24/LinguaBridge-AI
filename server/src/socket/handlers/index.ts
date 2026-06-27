import { Server, Socket } from "socket.io";
import { handleSetOnline, handleDisconnect } from "./status";
import { handleJoinChat, handleJoinUser, handleSendMessage, handleTyping, handleEditMessage, handleDeleteMessage, handleMessagesRead } from "./chat";
import { handleCallUser, handleCallAccepted, handleCallRejected, handleCallEnded, handleCallMute, handleCallIceCandidate } from "./call";

interface ExtendedSocket extends Socket {
  userId?: string;
}

export function setupSocketHandlers(io: Server) {
  io.on("connection", (socket: ExtendedSocket) => {
    console.log("Client connected:", socket.id);

    handleSetOnline(io, socket);
    handleJoinChat(io, socket);
    handleJoinUser(io, socket);
    handleSendMessage(io, socket);
    handleTyping(io, socket);
    handleEditMessage(io, socket);
    handleDeleteMessage(io, socket);
    handleMessagesRead(io, socket);

    handleCallUser(io, socket);
    handleCallAccepted(io, socket);
    handleCallRejected(io, socket);
    handleCallEnded(io, socket);
    handleCallMute(io, socket);
    handleCallIceCandidate(io, socket);

    handleDisconnect(io, socket);
  });
}
