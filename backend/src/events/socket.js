import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Join scoped rooms (dept:police, dept:fire_rescue, dept:ambulance, dept:central_admin, incident:<id>, hospital:<id>)
    socket.on('join:room', (roomName) => {
      socket.join(roomName);
    });

    socket.on('leave:room', (roomName) => {
      socket.leave(roomName);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
};
