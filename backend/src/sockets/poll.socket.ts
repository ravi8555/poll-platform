// // backend/src/sockets/poll.socket.ts
// import { Server as SocketServer, Socket } from 'socket.io';
// import { Response } from '../models/Response.model.js';
// import { Poll } from '../models/Poll.model.js';
// import jwt from 'jsonwebtoken';

// interface SocketWithUser extends Socket {
//   user?: {
//     id: string;
//     email: string;
//     name: string;
//   };
// }

// interface SocketWithUser extends Socket {
//   userId?: string;
// }

// export const setupSocketHandlers = (io: SocketServer) => {
//   // Authentication middleware for socket.io
//   io.use(async (socket: SocketWithUser, next) => {
//     try {
//       const token = socket.handshake.auth.token;
//       if (token) {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
//         socket.userId = decoded.id;
//       }
//       next();
//     } catch (err) {
//       next();
//     }
//   });

//  io.on('connection', (socket: SocketWithUser) => {
//     console.log('Client connected:', socket.id);

//     // Join poll room for real-time updates
//     socket.on('join-poll', async (pollId: string) => {
//       socket.join(`poll_${pollId}`);
//       console.log(`Socket ${socket.id} joined poll_${pollId}`);
      
//       // Send current response count immediately
//       const responseCount = await Response.countDocuments({ pollId });
//       io.to(`poll_${pollId}`).emit('response-count-update', { pollId, count: responseCount });
//     });

//     socket.on('leave-poll', (pollId: string) => {
//       socket.leave(`poll_${pollId}`);
//       console.log(`Socket ${socket.id} left poll_${pollId}`);
//     });

//     socket.on('disconnect', () => {
//       console.log('Client disconnected:', socket.id);
//     });
//   });
// };

// // Emit real-time update when new response is submitted
// export const emitResponseUpdate = async (io: SocketServer, pollId: string) => {
//   const responseCount = await Response.countDocuments({ pollId });
//   const poll = await Poll.findById(pollId);
  
//   io.to(`poll_${pollId}`).emit('response-count-update', { 
//     pollId, 
//     count: responseCount,
//     totalResponses: poll?.totalResponses 
//   });
  
//   // Also emit analytics update
//   io.to(`poll_${pollId}`).emit('analytics-update', { pollId });
// };


// backend/src/sockets/poll.socket.ts
import { Server as SocketServer, Socket } from 'socket.io';
import { Response } from '../models/Response.model.js';
import { Poll } from '../models/Poll.model.js';
import jwt from 'jsonwebtoken';

interface SocketWithUser extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: SocketServer) => {
  // Authentication middleware for socket.io
  io.use(async (socket: SocketWithUser, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        socket.userId = decoded.id;
        console.log('Socket authenticated for user:', socket.userId);
      }
      next();
    } catch (err) {
      console.log('Socket auth error:', err);
      next();
    }
  });

  io.on('connection', (socket: SocketWithUser) => {
    console.log('Client connected:', socket.id, 'User:', socket.userId);

    socket.on('join-poll', (pollId: string) => {
      const roomName = `poll_${pollId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined ${roomName}`);
      
      // Send a test event to confirm connection
      socket.emit('connection-confirmed', { message: 'Connected to poll room', pollId });
    });

    socket.on('leave-poll', (pollId: string) => {
      const roomName = `poll_${pollId}`;
      socket.leave(roomName);
      console.log(`Socket ${socket.id} left ${roomName}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

// Emit real-time update when new response is submitted
// export const emitResponseUpdate = async (io: SocketServer, pollId: string) => {
//   const responseCount = await Response.countDocuments({ pollId });
//   const poll = await Poll.findById(pollId);
  
//   console.log(`Emitting response update for poll ${pollId}: ${responseCount} responses`);
  
//   io.to(`poll_${pollId}`).emit('response-count-update', { 
//     pollId, 
//     count: responseCount,
//     totalResponses: poll?.totalResponses 
//   });
  
//   // Also emit analytics update
//   io.to(`poll_${pollId}`).emit('analytics-update', { pollId });
// };

// backend/src/sockets/poll.socket.ts
export const emitResponseUpdate = (io: SocketServer, pollId: string) => {
  const roomName = `poll_${pollId}`;
  console.log(`Emitting response-count-update to room: ${roomName}`);
  
  // Emit to the specific room
  io.to(roomName).emit('response-count-update', { 
    pollId, 
    count: 'update', 
    message: 'New response received'
  });
  
  // Also emit to all connected clients for debugging
  io.emit('debug-message', { message: 'Response submitted', pollId });
};