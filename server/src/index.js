require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 ChatSphere server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Server shutting down gracefully...');
  const mongoose = require('mongoose');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});
