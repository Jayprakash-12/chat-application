require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Room = require('../models/Room');

const defaultRooms = [
  { name: 'General', description: 'General chat for everyone 💬' },
  { name: 'Tech Talk', description: 'Discuss programming, tools, and tech 🛠️' },
  { name: 'Random', description: 'Anything goes — share memes, ideas, or just say hi 🎲' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chatsphere');
    console.log('✅ Connected to MongoDB');

    for (const roomData of defaultRooms) {
      const exists = await Room.findOne({ name: roomData.name });
      if (!exists) {
        await Room.create(roomData);
        console.log(`✅ Created room: ${roomData.name}`);
      } else {
        console.log(`⏭️  Room already exists: ${roomData.name}`);
      }
    }

    console.log('🌱 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
