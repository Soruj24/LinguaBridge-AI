import { Server, Socket } from "socket.io";
import { ConnectedUsers } from "./connectionTypes";

export interface TypingData {
  to: string;
}

export interface GroupTypingData {
  groupId: string;
}

export interface MarkAsReadData {
  messageId: string;
}

export interface UserTypingData {
  username: string;
  typing: boolean;
}

export interface GroupTypingStartData {
  groupId: string;
  user: string;
}

export interface GroupTypingStopData {
  groupId: string;
  user: string;
}

export interface InitAuthHandlers {
  (io: Server, socket: Socket, connectedUsers: ConnectedUsers): void;
}

export interface InitChatHandlers {
  (io: Server, socket: Socket, connectedUsers: ConnectedUsers): void;
}
