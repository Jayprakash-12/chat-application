# ChatSphere — Real-Time Chat Application

## What This Is

A full-stack real-time chat application enabling users to join named chat rooms, exchange instant messages via WebSocket connections, and view chat history persisted in MongoDB. Built for developers and learners wanting a production-quality group chat system powered by Node.js, React, Socket.io, and MongoDB.

## Core Value

Messages delivered and persisted in real time — users can join any room and immediately see who's online, what's been said, and continue the conversation without page refreshes.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Backend -->
- [ ] Express + Socket.io server with CORS configured
- [ ] `joinRoom` socket event — user joins a specific room and receives history
- [ ] `chatMessage` socket event — broadcast messages to all room members
- [ ] `typing` socket event — notify others a user is typing
- [ ] `onlineUsers` socket event — broadcast active user list per room
- [ ] MongoDB integration with Mongoose (Message, Room, User models)
- [ ] Chat history loaded on room join (last N messages)
- [ ] REST endpoint to list available rooms

<!-- Frontend -->
- [ ] React app with Socket.io client configured
- [ ] Username entry / guest login screen (no password required in basic version)
- [ ] Room list / lobby screen — browse and join rooms
- [ ] ChatRoom component — scrollable message feed
- [ ] MessageInput component — text field with send button, blocks empty sends
- [ ] OnlineUsersList sidebar — live updates via socket
- [ ] TypingIndicator component — "User is typing…" display
- [ ] Room navigation — switch between rooms dynamically

<!-- General -->
- [ ] Messages display sender username + timestamp
- [ ] Rooms function independently (no cross-room message bleed)
- [ ] Responsive UI inspired by WhatsApp Group Chat layout

### Out of Scope

- Password-based authentication — kept simple with username-only guest mode (can be added post-MVP)
- Direct/1-to-1 private messaging — rooms only for v1
- File/image sharing — text only for v1
- Push notifications — browser tab focus sufficient for v1
- Message editing or deletion — append-only for v1

## Context

- Greenfield project — `chat-application/` folder was empty at project start
- Workspace parent contains `mini-social-app/` — a prior full-stack project using similar patterns (React + Node.js + MongoDB)
- Target: a clean, well-structured codebase suitable for a portfolio or internship showcase
- UI inspiration: WhatsApp Group Chat — sidebar with rooms/users, main message area, input bar at bottom

## Constraints

- **Tech Stack**: Node.js + Express (backend), React.js (frontend), Socket.io (real-time), MongoDB + Mongoose (persistence) — fixed by spec
- **Simplicity**: Guest-mode auth only (username, no JWT/sessions required for v1) — reduces scope
- **Monorepo Layout**: `/server` for backend, `/client` for React frontend — clean separation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Socket.io over raw WebSockets | Built-in room support, reconnection, fallback to polling | — Pending |
| Guest-mode auth (username only) | Reduces auth complexity, ships faster, covers core feature | — Pending |
| MongoDB for persistence | Flexible schema for messages, matches team's prior stack | — Pending |
| Monorepo (server/ + client/) | Simpler local dev, single git repo, easy to demo | — Pending |
| Vite for React frontend | Faster than CRA, modern default, no eject needed | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-15 after initialization*
