const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: { type: Date, default: Date.now },
});

// Compound index for efficient room history queries
messageSchema.index({ room: 1, timestamp: 1 });

module.exports = mongoose.model('Message', messageSchema);
