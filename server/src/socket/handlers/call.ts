import { Server, Socket } from "socket.io";

interface ExtendedSocket extends Socket {
  userId?: string;
}

export function handleCallUser(io: Server, socket: ExtendedSocket) {
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
}

export function handleCallAccepted(io: Server, socket: ExtendedSocket) {
  socket.on("call_accepted", ({ callerId, signalData }) => {
    io.to(callerId).emit("call_accepted", { signalData });
  });
}

export function handleCallRejected(io: Server, socket: ExtendedSocket) {
  socket.on("call_rejected", ({ callerId }) => {
    io.to(callerId).emit("call_rejected");
  });
}

export function handleCallEnded(io: Server, socket: ExtendedSocket) {
  socket.on("call_ended", ({ targetUserId }) => {
    io.to(targetUserId).emit("call_ended");
  });
}

export function handleCallMute(io: Server, socket: ExtendedSocket) {
  socket.on("call_mute", ({ targetUserId, muted }) => {
    io.to(targetUserId).emit("call_mute", { muted });
  });
}

export function handleCallIceCandidate(io: Server, socket: ExtendedSocket) {
  socket.on("call_ice_candidate", ({ targetUserId, candidate }) => {
    io.to(targetUserId).emit("call_ice_candidate", { candidate });
  });
}
