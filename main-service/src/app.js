// main-service/src/app.js (Updated Socket.io for user-to-user chat)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const postRoutes = require('./routes/postRoutes');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', postRoutes);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));


const { sendMessage } = require('./controllers/chatController');
io.on('connection', (socket) => {
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
  });
  socket.on('sendMessage', async (data) => {
    // data: { chatId, message, userId }
    try {
      const savedMsg = await sendMessage(data.chatId, data.userId, data.message);
      io.to(data.chatId).emit('receiveMessage', {
        chatId: data.chatId,
        senderId: data.userId,
        content: data.message,
        createdAt: savedMsg.createdAt,
      });
    } catch (err) {
      // Optionally emit error to client
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  socket.on('joinUser', (userId) => {
    socket.join(`user:${userId}`); // Join user-specific room for notifications
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.set('io', io);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = { app, server, io };


