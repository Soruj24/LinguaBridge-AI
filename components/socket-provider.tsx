"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (session?.user) {
      // Connect to the same origin
      const socketInstance = io();

      socketInstance.on("connect", () => {
        console.log("Socket connected:", socketInstance.id);
        // Join user-specific room for notifications
        if (session.user.id) {
          socketInstance.emit("join_user", session.user.id);
        }
      });

      // eslint-disable-next-line
      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [session]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
