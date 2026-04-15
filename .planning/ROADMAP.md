# ROADMAP — ChatSphere v1.0

## Milestone 1 — Real-Time Chat MVP

**Goal:** Fully functional real-time group chat with room support, online users, typing indicators, and persistent history.

**Stack:** Node.js + Express + Socket.io + MongoDB + React (Vite)

---

## Phase 1 — Project Scaffolding & Infrastructure

**Goal:** Set up the monorepo structure, initialize both server and client packages, configure environment handling, and connect to MongoDB.

**Covers:** REQ-001, REQ-002, REQ-003

### Plans

#### 1.1 — Monorepo skeleton
- Create `server/` and `client/` directories
- Root `package.json` with `concurrently` dev script
- Root `.gitignore` (node_modules, .env, dist, build)
- `server/.env.example` with PORT, MONGO_URI, CLIENT_ORIGIN
- `client/.env.example` with VITE_SOCKET_URL

#### 1.2 — Backend base server
- `npm init` in `server/`, install: express, socket.io, mongoose, dotenv, cors, nodemon
- `server/src/index.js` — Express app + HTTP server + Socket.io attach
- CORS configured for CLIENT_ORIGIN
- Basic health check route: `GET /health`
- nodemon dev script

#### 1.3 — MongoDB connection
- `server/src/config/db.js` — Mongoose connect with error handling
- Called at startup; logs success/failure
- Graceful SIGINT shutdown

#### 1.4 — React client bootstrap
- `npm create vite@latest client -- --template react` in `client/`
- Install: socket.io-client, react-router-dom, axios
- Clean out CRA boilerplate, set up folder structure: `components/`, `pages/`, `hooks/`, `utils/`, `context/`
- Verify `npm run dev` runs on port 5173

**UAT:**
- `npm run dev` from root starts both server (3001) and client (5173)
- `GET /health` returns `{ status: "ok" }`
- Server logs "MongoDB connected" on startup

---

## Phase 2 — Data Models & REST API

**Goal:** Define Mongoose schemas and implement REST endpoints for managing rooms and loading message history.

**Covers:** REQ-010, REQ-011, REQ-012, REQ-020, REQ-021, REQ-022

### Plans

#### 2.1 — Mongoose models
- `server/src/models/User.js` — username (unique), createdAt
- `server/src/models/Room.js` — name (unique), description, createdAt
- `server/src/models/Message.js` — room ref, username, content, timestamp; compound index `{ room, timestamp }`

#### 2.2 — Rooms REST API
- `server/src/routes/rooms.js`
- `GET /api/rooms` — list all rooms
- `POST /api/rooms` — create room (validate name non-empty, unique)
- `GET /api/rooms/:roomId/messages` — last 50 messages sorted asc by timestamp
- Mount router in `index.js`

#### 2.3 — Seed data
- `server/src/scripts/seed.js` — create 3 default rooms: General, Tech Talk, Random
- `npm run seed` script in server package.json

**UAT:**
- `GET /api/rooms` returns seeded rooms array
- `POST /api/rooms` with `{ "name": "test" }` creates and returns new room
- Duplicate room name returns 409
- `GET /api/rooms/:id/messages` returns empty array for new room

---

## Phase 3 — Socket.io Backend Events

**Goal:** Implement all real-time socket event handlers on the server — join, message, typing, leave, disconnect.

**Covers:** REQ-030, REQ-031, REQ-032, REQ-033, REQ-034

**Depends on:** Phase 2

### Plans

#### 3.1 — Socket connection manager
- `server/src/socket/index.js` — extract socket.io logic from main index
- In-memory map: `socketId → { username, roomId }`
- Helper: `getUsersInRoom(roomId)` → array of usernames

#### 3.2 — joinRoom handler
- On `joinRoom { username, roomId }`:
  - Socket joins room
  - Update memory map
  - Query last 50 messages, emit `chatHistory` to socket
  - Emit `onlineUsers` (array) to room
  - Emit `systemMessage` to room: "{username} joined"

#### 3.3 — chatMessage handler
- On `chatMessage { roomId, username, content }`:
  - Validate content non-empty (server-side guard)
  - Save to MongoDB (Message model)
  - Broadcast `newMessage { username, content, timestamp }` to room

#### 3.4 — typing handler
- On `typing { roomId, username, isTyping }`:
  - Broadcast `typingUpdate { username, isTyping }` to room (excluding sender via `socket.to(roomId)`)

#### 3.5 — leaveRoom + disconnect handlers
- On `leaveRoom { roomId, username }`:
  - Socket leaves room, remove from memory map
  - Emit updated `onlineUsers` to room
  - Emit `systemMessage`: "{username} left"
- On `disconnect`:
  - Look up from memory map by socketId
  - Perform same leaveRoom cleanup

**UAT:**
- Two browser tabs: both show "online users" update when joined
- Send message in tab 1 → appears in tab 2 instantly
- Close tab 1 → tab 2 sees user removed from online list
- DB has message documents after chat

---

## Phase 4 — Frontend: Auth & Lobby

**Goal:** Implement the username entry screen and room lobby — the two pre-chat screens.

**Covers:** REQ-040, REQ-041

**Depends on:** Phase 1

### Plans

#### 4.1 — Global state / context
- `client/src/context/ChatContext.jsx` — React Context providing: `username`, `setUsername`, `currentRoom`, `setCurrentRoom`
- Persist username to localStorage on set

#### 4.2 — LoginPage component
- Route: `/`
- Username input with validation (2–20 chars, alphanumeric + underscores)
- Error message on invalid input
- On submit → save to context + navigate to `/lobby`
- Styled: centered card, dark background, brand color accent

#### 4.3 — LobbyPage + RoomCard component
- Route: `/lobby`
- Fetches rooms from `GET /api/rooms` on mount
- Renders grid of RoomCard components (name, description, "Join" button)
- "Create Room" button → inline modal form (name + description inputs)
- POST to `/api/rooms`, refresh list on success
- Click "Join" → navigate to `/room/:roomId`

**UAT:**
- Fresh load → redirected to `/` (no username yet)
- Enter username "alice" → lands on `/lobby` with room list
- Refresh → username restored from localStorage, goes to lobby
- Create new room → appears in list immediately

---

## Phase 5 — Frontend: ChatRoom Core

**Goal:** Build the ChatRoom screen — socket connection, message feed, input bar. Core real-time loop.

**Covers:** REQ-042, REQ-050, REQ-051, REQ-052

**Depends on:** Phase 3, Phase 4

### Plans

#### 5.1 — useSocket custom hook
- `client/src/hooks/useSocket.js`
- Creates socket connection to VITE_SOCKET_URL
- Returns socket instance
- Cleans up (disconnect) on component unmount

#### 5.2 — ChatRoomPage layout
- Route: `/room/:roomId`
- Fetches room name from context or API
- On mount: emit `joinRoom { username, roomId }`
- On unmount: emit `leaveRoom { username, roomId }`, disconnect
- Listens: `chatHistory`, `newMessage`, `systemMessage` → append to messages state
- Layout: Header | MessageFeed + OnlineUsersList sidebar | TypingIndicator | MessageInput

#### 5.3 — MessageFeed component
- `client/src/components/MessageFeed.jsx`
- Renders list; own messages right-aligned (bubble), others left-aligned
- System messages centered, italic, muted
- Each message: avatar initial bubble + username + time (e.g. "2:34 PM")
- `useEffect` auto-scroll to bottom on new message
- ref on bottom sentinel div

#### 5.4 — MessageInput component
- `client/src/components/MessageInput.jsx`
- Controlled `<input>` + Send button
- Emit `chatMessage` on Enter or button click
- Block send if trimmed content is empty (button disabled)
- Clear input after send
- Emit `typing { isTyping: true }` on keydown, `{ isTyping: false }` after 2s idle (debounce with `setTimeout`)

**UAT:**
- Join room → see "You joined the room" system message
- Send message → appears on own side immediately
- Open second tab with different username → both see each other's messages in real time
- Chat history loads (from earlier test messages)

---

## Phase 6 — Frontend: Online Users & Typing Indicator

**Goal:** Wire up the OnlineUsersList and TypingIndicator components to live socket events.

**Covers:** REQ-053, REQ-054

**Depends on:** Phase 5

### Plans

#### 6.1 — OnlineUsersList component
- `client/src/components/OnlineUsersList.jsx`
- Accepts `users` array + `currentUsername` prop
- Renders sorted list; current user shown as "you (alice)" highlighted
- Updates live when `onlineUsers` event fires in parent

#### 6.2 — TypingIndicator component
- `client/src/components/TypingIndicator.jsx`
- Parent tracks `typingUsers` map from `typingUpdate` events
- This component receives array of currently-typing usernames
- Renders: hidden if empty, "alice is typing…" for one, "alice and bob are typing…" for two, "Several people are typing…" for 3+
- Animated CSS ellipsis: `•••` pulse

#### 6.3 — Wire events in ChatRoomPage
- Listen `onlineUsers` → update `users` state → pass to OnlineUsersList
- Listen `typingUpdate { username, isTyping }` → update `typingUsers` map → pass to TypingIndicator
- Exclude self from typing display

**UAT:**
- Tab 1 typing → Tab 2 sees "alice is typing…" within 500ms
- Tab 1 stops typing → indicator clears after 2s
- Tab 2 joins → Tab 1 online users list updates immediately
- Tab 2 leaves → Tab 1 online users list removes them

---

## Phase 7 — UI Polish, Responsiveness & Error Handling

**Goal:** Apply final design polish, responsive layout for tablet/mobile, error states, and empty states.

**Covers:** REQ-060, REQ-061, REQ-062, REQ-063

**Depends on:** Phase 6

### Plans

#### 7.1 — Design system & global styles
- Google Fonts: Inter (body), applied globally in `index.css`
- CSS variables: `--bg-primary`, `--bg-secondary`, `--accent`, `--text-primary`, `--text-muted`, `--bubble-own`, `--bubble-other`
- Dark mode theme (deep charcoal + teal/cyan accent)
- Smooth scroll, transition easing tokens

#### 7.2 — Responsive layout
- Desktop (1024px+): sidebar always visible
- Tablet (768–1024px): sidebar collapsed, toggle button in header
- Mobile (<768px): sidebar as bottom sheet overlay
- MessageFeed fills remaining height via `flex-grow`

#### 7.3 — Error & empty states
- Lobby: "No rooms yet — create the first one!" empty state
- ChatRoom: "No messages yet — say hello!" when history is empty
- Connection lost → toast banner: "Reconnecting…" (socket reconnect event)
- API errors → toast notification (top-right, auto-dismiss 4s)

#### 7.4 — Performance & UX
- Debounce typing events (already in REQ — verify implementation)
- Limit MessageFeed render to 200 messages (virtualize older ones out)
- Smooth entry animation for new messages (fade + slide up, CSS keyframes)
- Send button: ripple effect on click

**UAT:**
- Resize window to 768px → sidebar toggle appears
- Kill server → client shows "Reconnecting…" banner
- Restart server → client reconnects, banner disappears
- 50+ messages in room → feed scrolls smoothly

---

## Phase 8 — End-to-End Testing & Documentation

**Goal:** Verify the full user flow works end-to-end, write README, and confirm all UAT criteria pass.

**Depends on:** Phase 7

### Plans

#### 8.1 — End-to-end UAT checklist verification
- Full flow: username entry → lobby → create room → join → send messages → typing indicator → leave → rejoin (history loads)
- Multi-tab simulation for real-time features
- Edge cases: empty username, empty message, duplicate room name

#### 8.2 — README.md
- Project overview with screenshot/GIF placeholder
- Prerequisites (Node 18+, MongoDB)
- Setup instructions: clone → `.env` setup → `npm install` → `npm run seed` → `npm run dev`
- Available socket events table
- Folder structure diagram

#### 8.3 — Code cleanup
- Remove `console.log` debug statements from production paths
- Consistent error handling across all route handlers
- Add JSDoc comments to socket handler functions

**UAT:**
- `README.md` setup steps work from scratch (fresh clone simulation)
- No unhandled promise rejections in server logs during normal use
- All Phase 1–7 UAT criteria re-verified

---

## Summary

| Phase | Focus | Plans | Key Deliverable |
|-------|-------|-------|----------------|
| 1 | Scaffolding | 4 | Runnable monorepo, DB connected |
| 2 | Models + API | 3 | REST endpoints, seeded rooms |
| 3 | Socket Backend | 5 | Real-time events wired |
| 4 | Frontend Auth/Lobby | 3 | Login + Room browser |
| 5 | ChatRoom Core | 4 | Messages send/receive in real time |
| 6 | Users + Typing | 3 | Online list + typing indicator live |
| 7 | Polish + Responsive | 4 | Production-ready UI |
| 8 | Testing + Docs | 3 | README, verified UAT |
| **Total** | | **29 plans** | **Working chat app** |
