const { io } = require('socket.io-client');
const axios = require('axios');

async function test() {
  console.log('Testing connection to backend...');
  try {
    let token = '';
    let username = 'tester_bot123';
    
    try {
      const res = await axios.post('http://localhost:3001/api/auth/register', {
        username: username,
        password: 'password123'
      });
      token = res.data.token;
    } catch(e) {
      const res2 = await axios.post('http://localhost:3001/api/auth/login', {
        username: username,
        password: 'password123'
      });
      token = res2.data.token;
    }

    console.log(`[Test] Got token: ${token.substring(0,10)}...`);

    // 2. socket connect
    const socket = io('http://localhost:3001', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log(`[Test] Socket connected successfully! ID: ${socket.id}`);
      socket.emit('joinRoom', { username, roomId: '661e8cf0b4d455b8e9076543' });
    });

    socket.on('connect_error', (err) => {
      console.error(`[Test] Socket connection error:`, err);
      process.exit(1);
    });

    socket.on('onlineUsers', (users) => {
      console.log(`[Test] onlineUsers received:`, users);
      process.exit(0);
    });

    setTimeout(() => {
      console.log('[Test] Timeout waiting for onlineUsers');
      process.exit(1);
    }, 4000);

  } catch (err) {
    console.error('[Test] HTTP Error:', err);
  }
}

test();
