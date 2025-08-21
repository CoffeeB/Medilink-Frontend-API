import { getStoredUser } from "@/hooks/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

/**
 * Create the context
 * use the context -> useContext(socketCxt)
 */
type SocketContextType = Socket | null;
const SocketContext = createContext<SocketContextType>(null);
export const useSocketContext = () => useContext(SocketContext);
export default function SocketContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [socket, setSocket] = useState<SocketContextType>(null);
  const user = getStoredUser();
  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    );
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!user?.id || !socket) return;
    socket.emit("register_user", {
      userId: user?.id,
    });

    socket?.on("connect_error", (error: Error) => {
      return error;
    });
    socket?.on("user_joined", (data) => {
      console.log("user_joined:", data);
    });

    return () => {
      socket.off("connect_error");
      socket.off("user_joined");
    };
  }, [user?.id, socket]);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
