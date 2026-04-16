require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const wipe = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.db.dropCollection('users').catch(() => console.log('Users collection might not exist yet, skipping drop.'));
    console.log('✅ Users collection dropped successfully for fresh Auth pass.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Wipe error:', err.message);
    process.exit(1);
  }
};
wipe();
