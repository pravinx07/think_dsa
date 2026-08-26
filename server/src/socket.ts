import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

type Problem = {
  title: string;
  url: string;
  difficulty: string;
};

type RoomUser = {
  clerkId: string;
  username: string;
  status: 'Idle' | 'Coding' | 'Stuck' | 'Solved' | 'Given Up';
  progress: { passed: number; total: number };
  timeElapsed: number;
  ws: WebSocket;
};

type Room = {
  roomId: string;
  problem: Problem | null;
  users: Map<string, RoomUser>;
};

const rooms = new Map<string, Room>();

export function initSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws/lobby' });

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomId: string | null = null;
    let currentUserClerkId: string | null = null;

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);

        switch (data.type) {
          case 'join': {
            const { roomId, username, clerkId } = data;
            if (!roomId || !username || !clerkId) return;

            currentRoomId = roomId;
            currentUserClerkId = clerkId;

            let room = rooms.get(roomId);
            if (!room) {
              room = {
                roomId,
                problem: null,
                users: new Map(),
              };
              rooms.set(roomId, room);
            }

            // Add or update user
            room.users.set(clerkId, {
              clerkId,
              username,
              status: 'Idle',
              progress: { passed: 0, total: 10 },
              timeElapsed: 0,
              ws,
            });

            broadcastRoomState(roomId);
            break;
          }

          case 'update': {
            if (!currentRoomId || !currentUserClerkId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            const user = room.users.get(currentUserClerkId);
            if (!user) return;

            if (data.status) user.status = data.status;
            if (data.progress) user.progress = data.progress;
            if (typeof data.timeElapsed === 'number') user.timeElapsed = data.timeElapsed;

            broadcastRoomState(currentRoomId);
            break;
          }

          case 'select_problem': {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            const { problem } = data; // { title, url, difficulty }
            room.problem = problem;

            // Reset everybody's status to Coding
            for (const user of room.users.values()) {
              user.status = 'Coding';
              user.progress = { passed: 0, total: 10 };
              user.timeElapsed = 0;
            }

            broadcastRoomState(currentRoomId);
            break;
          }

          case 'chat': {
            if (!currentRoomId || !currentUserClerkId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            const user = room.users.get(currentUserClerkId);
            if (!user) return;

            const chatMsgPayload = JSON.stringify({
              type: 'chat_message',
              message: {
                sender: user.username,
                text: data.text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            });

            for (const u of room.users.values()) {
              if (u.ws.readyState === WebSocket.OPEN) {
                u.ws.send(chatMsgPayload);
              }
            }
            break;
          }

          case 'ping': {
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('Socket message parse error:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomId && currentUserClerkId) {
        const room = rooms.get(currentRoomId);
        if (room) {
          room.users.delete(currentUserClerkId);
          if (room.users.size === 0) {
            rooms.delete(currentRoomId);
          } else {
            broadcastRoomState(currentRoomId);
          }
        }
      }
    });
  });
}

function broadcastRoomState(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const usersList = Array.from(room.users.values()).map(u => ({
    clerkId: u.clerkId,
    username: u.username,
    status: u.status,
    progress: u.progress,
    timeElapsed: u.timeElapsed,
  }));

  const payload = JSON.stringify({
    type: 'room_state',
    roomId: room.roomId,
    problem: room.problem,
    users: usersList,
  });

  for (const user of room.users.values()) {
    if (user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(payload);
    }
  }
}
