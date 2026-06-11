"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

function isVercel(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.endsWith(".vercel.app");
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!session?.user || isVercel()) return;

    const socketInstance = io({
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
