const express = require('express');
const cors = require('cors');
const roomRoutes = require('./routes/rooms');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Root route - friendly message
app.get('/', (req, res) => {
  res.send('<h1>🚀 ChatSphere API is Live</h1><p>The backend is running perfectly. Use the <a href="https://chat-application-peach-omega.vercel.app">Frontend App</a> to start chatting!</p>');
});

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;
