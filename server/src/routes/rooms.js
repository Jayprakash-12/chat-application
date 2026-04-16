const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Message = require('../models/Message');

// GET /api/rooms — list all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// POST /api/rooms - Create a new room
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Basic validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const roomExists = await Room.findOne({ name: name.trim() });
    if (roomExists) {
      return res.status(400).json({ error: 'Room name already exists' });
    }

    const newRoom = await Room.create({
      name: name.trim(),
      description: description?.trim() || ''
    });

    res.status(201).json(newRoom);
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ error: 'Server error creating room' });
  }
});

// DELETE /api/rooms/:id - Delete a room and its messages
router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    await Message.deleteMany({ room: room._id });
    await Room.findByIdAndDelete(room._id);
    
    res.json({ message: 'Room and its messages deleted successfully' });
  } catch (err) {
    console.error('Delete room error:', err);
    res.status(500).json({ error: 'Server error deleting room' });
  }
});

// GET /api/rooms/:roomId/messages — last 50 messages
router.get('/:roomId/messages', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
    res.json(messages.reverse()); // ascending for display
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
