'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(userId: string): Socket {
  if (socket?.connected) return socket;
  socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
    query: { userId },
    transports: ['websocket', 'polling'],
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
