// socket.ts
import { io } from "socket.io-client";

// replace with your server URL
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true,
});
