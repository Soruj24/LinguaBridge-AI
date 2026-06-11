// Socket.io server now runs as a separate Express server.
// This module provides a stub for API routes that emit events.
// On Vercel/serverless, getIO() returns null (no WebSocket support).
// When running locally with the socket server, it connects to it.

import { Server } from "socket.io";

let io: Server | null = null;

export function setIO(instance: Server) {
  io = instance;
}

export function getIO(): Server | null {
  // On Vercel or when socket server isn't running, return null
  if (typeof window !== "undefined") return null;
  return io;
}
