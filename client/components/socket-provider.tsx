"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

function getSocketUrl(): string {
  if (typeof window === "undefined") return "";

  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  return `http://localhost:${process.env.NEXT_PUBLIC_SOCKET_PORT || "5000"}`;
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const userIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    if (userIdRef.current === userId) return;
    userIdRef.current = userId;

    const url = getSocketUrl();
    if (!url) return;

    const socketInstance = io(url, {
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 5000,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      socketInstance.emit("join_user", userId);
    });

    socketInstance.on("connect_error", () => {
      socketInstance.disconnect();
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      userIdRef.current = undefined;
    };
  }, [session?.user?.id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
