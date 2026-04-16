# ChatSphere 💬

A modern, real-time chat application built with React, Node.js, Express, and Socket.io. ChatSphere offers a premium dark-mode experience with features like instant messaging, room management, and secure authentication.

## 🌐 Live Demo

- **Frontend**: [https://chat-application-peach-omega.vercel.app](https://chat-application-peach-omega.vercel.app)
- **Backend API**: [https://chat-application-jrui.onrender.com](https://chat-application-jrui.onrender.com)

## ✨ Features

- **Real-time Messaging**: Instant message delivery using Socket.io.
- **Room Management**: Create, join, and delete chat rooms.
- **Secure Authentication**: User registration and login powered by JWT and Bcrypt.
- **Typing Indicators**: See when others are typing in real-time.
- **Chat History**: Persistent messaging history stored in MongoDB.
- **Premium UI**: Responsive, dual-pane layout with a sleek dark aesthetic.

## 🚀 Tech Stack

**Frontend:**
- React (Vite)
- Socket.io-client
- Axios (API requests)
- React Router (Navigation)
- Vanilla CSS (Custom premium styling)

**Backend:**
- Node.js & Express
- Socket.io (Real-time communication)
- MongoDB & Mongoose (Database)
- JWT (Authentication)

---

## 🛠️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Jayprakash-12/chat-application.git
cd chat-application
```

### 2. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server/` directory:
   ```env
   PORT=3001
   MONGO_URI=your_mongodb_connection_string
   CLIENT_ORIGIN=http://localhost:5173
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client/` directory:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_SOCKET_URL=http://localhost:3001
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📄 License
This project is licensed under the MIT License.
