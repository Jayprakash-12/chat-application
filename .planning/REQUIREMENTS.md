# Requirements — ChatSphere

## Overview

Real-time group chat application. Users pick a username, join named rooms, send messages instantly, see who's online, and load history when they enter a room. All backed by Node.js + Express + Socket.io + MongoDB + React.

---

## 1. Infrastructure & Setup

### REQ-001 — Monorepo Layout
- `/server` — Node.js + Express + Socket.io backend
- `/client` — React (Vite) frontend
- Root `package.json` with `dev` script to run both concurrently
- `.gitignore` covering `node_modules`, `.env`, `dist`

### REQ-002 — Environment Configuration
- Backend reads from `.env`: `PORT`, `MONGO_URI`, `CLIENT_ORIGIN`
- Frontend reads from `.env`: `VITE_SOCKET_URL`
- Sample `.env.example` files committed for both

### REQ-003 — MongoDB Connection
- Mongoose used for all DB operations
- Connection established at server startup with error handling
- Graceful shutdown on SIGINT

---

## 2. Backend — Data Models

### REQ-010 — User Model
Fields: `username` (string, unique, required), `createdAt`

### REQ-011 — Room Model
Fields: `name` (string, unique, required), `description` (optional), `createdAt`

### REQ-012 — Message Model
Fields: `room` (ref → Room), `username` (string), `content` (string), `timestamp` (Date, default now)
Indexes: `{ room, timestamp }` for efficient history queries

---

## 3. Backend — REST API

### REQ-020 — GET /api/rooms
Returns list of all available rooms `[{ _id, name, description }]`

### REQ-021 — POST /api/rooms
Creates a new room. Body: `{ name, description? }`. Returns created room.

### REQ-022 — GET /api/rooms/:roomId/messages
Returns last 50 messages for a room, sorted ascending by timestamp.

---

## 4. Backend — Socket.io Events

### REQ-030 — joinRoom event (client → server)
Payload: `{ username, roomId }`
Server actions:
  - Add user to socket room
  - Track `{ socketId, username, roomId }` in memory map
  - Emit `chatHistory` to joining socket (last 50 messages from DB)
  - Emit `onlineUsers` to entire room (updated list)
  - Emit `systemMessage` to room: "**{username}** joined the room"

### REQ-031 — chatMessage event (client → server)
Payload: `{ roomId, username, content }`
Server actions:
  - Validate content is non-empty
  - Save message to MongoDB
  - Broadcast `newMessage` to all in room: `{ username, content, timestamp }`

### REQ-032 — typing event (client → server)
Payload: `{ roomId, username, isTyping }`
Server actions:
  - Broadcast `typingUpdate` to room (excluding sender): `{ username, isTyping }`

### REQ-033 — leaveRoom event (client → server)
Payload: `{ roomId, username }`
Server actions:
  - Remove from socket room
  - Remove from memory map
  - Emit updated `onlineUsers` to room
  - Emit `systemMessage`: "**{username}** left the room"

### REQ-034 — disconnect event (automatic)
Server actions:
  - Look up user from memory map by socketId
  - Perform same cleanup as leaveRoom

---

## 5. Frontend — Screens & Layout

### REQ-040 — Login / Username Screen
- Single input: "Enter your username"
- Validation: non-empty, 2–20 chars, alphanumeric + underscores
- Stores username in React state / localStorage

### REQ-041 — Lobby / Room List Screen
- Fetches rooms from GET /api/rooms
- Displays room cards with name + description
- "Create Room" button → inline form (name + optional description)
- Click room → navigates to ChatRoom screen

### REQ-042 — ChatRoom Screen Layout (inspired by WhatsApp Group)
```
┌─────────────────────────────────────────────┐
│  Room Name                          [Leave] │  ← Header
├──────────────────────────┬──────────────────┤
│                          │  Online Users    │
│   Message Feed           │  ──────────────  │
│   (scrollable)           │  • alice         │
│                          │  • bob           │
│                          │  • charlie       │
│                          │                  │
├──────────────────────────┴──────────────────┤
│  ⌨ alice is typing...                       │  ← Typing indicator
├─────────────────────────────────────────────┤
│  [Message input field]          [Send ➤]   │  ← Input bar
└─────────────────────────────────────────────┘
```

---

## 6. Frontend — Components

### REQ-050 — ChatRoom Component
- Receives: `username`, `roomId`, `roomName`
- Establishes socket connection, emits `joinRoom` on mount
- Listens: `chatHistory`, `newMessage`, `systemMessage`, `typingUpdate`, `onlineUsers`
- Cleans up socket on unmount (emits `leaveRoom`, disconnects)

### REQ-051 — MessageFeed Component
- Renders list of messages
- Own messages right-aligned, others left-aligned (bubble style)
- System messages centered, muted color
- Auto-scrolls to latest message
- Displays username + relative timestamp per message

### REQ-052 — MessageInput Component
- Controlled text input
- Emits `typing` event on keystroke (debounced, clears after 2s idle)
- Submit on Enter key OR Send button click
- Blocks sending of empty/whitespace-only messages
- Clears input after send

### REQ-053 — OnlineUsersList Component
- Displays sorted list of online usernames
- Highlights current user with "(you)" label
- Updates live via `onlineUsers` socket event

### REQ-054 — TypingIndicator Component
- Shows "**{username}** is typing…" for each active typer
- Multiple typers: "**alice** and **bob** are typing…"
- Hidden when no one is typing
- Animated ellipsis (CSS)

---

## 7. Non-Functional Requirements

### REQ-060 — Responsive Design
- Works on desktop (1024px+) and tablet (768px+)
- Mobile layout: sidebar collapses to toggle-able drawer

### REQ-061 — Empty State Validation
- Cannot send empty messages (button disabled + no event emitted)
- Cannot join with empty username

### REQ-062 — Error Handling
- DB connection failure → server logs error, responds 500
- Socket errors → client shows toast notification
- Room not found → 404 response with message

### REQ-063 — Performance
- History limited to last 50 messages per query
- Typing events debounced (not emitted on every keypress)

---

## Prioritization

| Priority | Requirements |
|----------|-------------|
| **P0 — Must Ship** | REQ-001–003, REQ-010–012, REQ-020–022, REQ-030–034, REQ-040–042, REQ-050–054 |
| **P1 — Should Ship** | REQ-060–063 |
| **P2 — Nice to Have** | Password auth, direct messaging, file sharing |
