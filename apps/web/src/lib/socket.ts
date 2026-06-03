import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@qazquiz/types";
import { io, type Socket } from "socket.io-client";

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: GameSocket | null = null;

/** Lazily create a single shared socket connection (client-side only). */
export function getSocket(): GameSocket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", {
      autoConnect: false,
      transports: ["websocket"],
    });
  }
  return socket;
}
