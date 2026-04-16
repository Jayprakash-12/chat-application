const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

// In-memory map: socketId → { username, roomId }
const connectedUsers = new Map();

/**
 * Returns array of usernames currently in a room
 * @param {string} roomId
 */
const getUsersInRoom = (roomId) => {
  const users = [];
  for (const [, data] of connectedUsers) {
    if (data.roomId === roomId) users.push(data.username);
  }
  return [...new Set(users)].sort();
};

/**
 * Initializes Socket.io on the HTTP server
 * @param {http.Server} server
 */
const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log(`[Socket Auth] Connection attempt. Token present?`, !!token);
    if (!token) return next(new Error('Authentication error'));
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'chatsphere_super_secret_key_123');
      console.log(`[Socket Auth] Token verified for socket ${socket.id}`);
      next();
    } catch (err) {
      console.error(`[Socket Auth] Verification failed:`, err.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── joinRoom ────────────────────────────────────────────────────────────
    socket.on('joinRoom', async ({ username, roomId }) => {
      if (!username || !roomId) return;

      // Leave any previous room first
      const prev = connectedUsers.get(socket.id);
      if (prev && prev.roomId !== roomId) {
        socket.leave(prev.roomId);
        const prevUsers = getUsersInRoom(prev.roomId);
        io.to(prev.roomId).emit('onlineUsers', prevUsers);
      }

      // Join new room
      socket.join(roomId);
      connectedUsers.set(socket.id, { username, roomId });

      // Send chat history (last 50 messages)
      try {
        const history = await Message.find({ room: roomId })
          .sort({ timestamp: -1 })
          .limit(50)
          .lean();
        socket.emit('chatHistory', history.reverse());
      } catch (err) {
        console.error('Error fetching chat history:', err.message);
        socket.emit('chatHistory', []);
      }

      // Broadcast updated online users
      const users = getUsersInRoom(roomId);
      io.to(roomId).emit('onlineUsers', users);

      // System message: user joined
      io.to(roomId).emit('systemMessage', {
        content: `${username} joined the room`,
        timestamp: new Date(),
      });

      console.log(`👤 ${username} joined room ${roomId}`);
    });

    // ─── chatMessage ─────────────────────────────────────────────────────────
    socket.on('chatMessage', async ({ roomId, username, content }) => {
      if (!content || !content.trim()) return; // server-side guard

      try {
        const message = await Message.create({
          room: roomId,
          username,
          content: content.trim(),
        });

        io.to(roomId).emit('newMessage', {
          _id: message._id,
          username: message.username,
          content: message.content,
          timestamp: message.timestamp,
        });
      } catch (err) {
        console.error('Error saving message:', err.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── typing ──────────────────────────────────────────────────────────────
    socket.on('typing', ({ roomId, username, isTyping }) => {
      // Broadcast to room excluding sender
      socket.to(roomId).emit('typingUpdate', { username, isTyping });
    });

    // ─── leaveRoom ───────────────────────────────────────────────────────────
    socket.on('leaveRoom', ({ roomId, username }) => {
      handleLeave(socket, io, socket.id, roomId, username);
    });

    // ─── deleteMessages ──────────────────────────────────────────────────────
    socket.on('deleteMessages', async ({ roomId, username, messageIds }) => {
      try {
        if (!messageIds || !messageIds.length) return;

        // Security check: Only delete messages that belong to this user
        // (Optional: In a real app we'd rigorously check token ID instead of just username)
        const result = await Message.deleteMany({
          _id: { $in: messageIds },
          username: username // Enforce "own" messages
        });

        if (result.deletedCount > 0) {
          io.to(roomId).emit('messagesDeleted', messageIds);
        }
      } catch (err) {
        console.error('Error deleting messages:', err.message);
      }
    });

    // ─── disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        handleLeave(socket, io, socket.id, user.roomId, user.username);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Shared leave/cleanup logic
 */
const handleLeave = (socket, io, socketId, roomId, username) => {
  socket.leave(roomId);
  connectedUsers.delete(socketId);

  const users = getUsersInRoom(roomId);
  io.to(roomId).emit('onlineUsers', users);
  io.to(roomId).emit('systemMessage', {
    content: `${username} left the room`,
    timestamp: new Date(),
  });
};

module.exports = { initSocket, getUsersInRoom };
