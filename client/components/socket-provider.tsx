"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

function getSocketUrl(): string {
  if (typeof window === "undefined") return "";

  // In production (Vercel), use the dedicated socket server URL
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  // In local dev, connect to localhost:3001
  return `http://localhost:${process.env.NEXT_PUBLIC_SOCKET_PORT || "3001"}`;
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const url = getSocketUrl();
    if (!url) return;

    const socketInstance = io(url, {
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 5000,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      if (session.user.id) {
        socketInstance.emit("join_user", session.user.id);
      }
    });

    socketInstance.on("connect_error", () => {
      socketInstance.disconnect();
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
