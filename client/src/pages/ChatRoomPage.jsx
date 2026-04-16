import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChatContext } from '../context/ChatContext'
import { useSocket } from '../hooks/useSocket'
import MessageFeed from '../components/MessageFeed'
import MessageInput from '../components/MessageInput'
import TypingIndicator from '../components/TypingIndicator'
import './ChatRoomPage.css'

export default function ChatRoomPage() {
  const { roomId } = useParams()
  const { username, currentRoom } = useChatContext()
  const navigate = useNavigate()
  const socket = useSocket()

  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState({}) // { username: bool }
  const [connected, setConnected] = useState(true)
  const [selectedMessages, setSelectedMessages] = useState([])

  const roomName = currentRoom?.name || 'Chat Room'

  useEffect(() => {
    if (!socket || !username || !roomId) return

    // Emit join
    socket.emit('joinRoom', { username, roomId })

    // Listen for chat history
    socket.on('chatHistory', (history) => {
      setMessages(history.map(m => ({ ...m, type: 'message' })))
    })

    // Listen for new messages
    socket.on('newMessage', (msg) => {
      setMessages(prev => [...prev.slice(-199), { ...msg, type: 'message' }])
    })

    // Listen for system messages
    socket.on('systemMessage', (msg) => {
      setMessages(prev => [...prev, { ...msg, type: 'system', _id: Date.now() }])
    })

    // Online users
    socket.on('onlineUsers', (users) => setOnlineUsers(users))

    // Piping typing updates
    socket.on('typingUpdate', ({ username: typingUser, isTyping }) => {
      setTypingUsers(prev => {
        const next = { ...prev }
        if (isTyping) next[typingUser] = true
        else delete next[typingUser]
        return next
      })
    })

    // Deleted messages event
    socket.on('messagesDeleted', (deletedIds) => {
      setMessages(prev => prev.filter(m => !deletedIds.includes(m._id)))
      // Clean up selection if we deleted them
      setSelectedMessages(prev => prev.filter(id => !deletedIds.includes(id)))
    })

    // Connection events
    socket.on('disconnect', () => setConnected(false))
    socket.on('connect', () => setConnected(true))
    socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message)
      setConnected(false)
    })

    return () => {
      socket.emit('leaveRoom', { roomId, username })
      socket.off('chatHistory')
      socket.off('newMessage')
      socket.off('systemMessage')
      socket.off('onlineUsers')
      socket.off('typingUpdate')
      socket.off('messagesDeleted')
      socket.off('disconnect')
      socket.off('connect')
    }
  }, [socket, username, roomId])

  const sendMessage = (content) => {
    socket.emit('chatMessage', { roomId, username, content })
  }

  const sendTyping = (isTyping) => {
    socket.emit('typing', { roomId, username, isTyping })
  }

  // Active typers (exclude self)
  const activeTypers = Object.keys(typingUsers).filter(u => u !== username)

  return (
    <div className="chatroom-pane">
      {/* Chat Header */}
      {selectedMessages.length > 0 ? (
        <header className="chatroom-pane-header selection-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn-icon" onClick={() => setSelectedMessages([])} title="Cancel Selection">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{selectedMessages.length} selected</span>
          </div>
          <button
            className="btn-icon"
            onClick={() => {
              socket.emit('deleteMessages', { roomId, username, messageIds: selectedMessages })
            }}
            title="Delete Messages"
            style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </header>
      ) : (
        <header className="chatroom-pane-header">
          <div className="chatroom-room-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn-icon"
              onClick={() => navigate('/app')}
              title="Back to lobby"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '4px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <span className="chatroom-room-hash">#</span>
            <span className="chatroom-room-name">{roomName}</span>
          </div>
          <div className="chatroom-header-right" style={{ gap: '16px' }}>
            <span className="badge">{onlineUsers.length} online</span>
          </div>
        </header>
      )}

      {/* Main chat area */}
      <div className="chatroom-pane-main">
        <MessageFeed
          messages={messages}
          username={username}
          selectedMessages={selectedMessages}
          setSelectedMessages={setSelectedMessages}
        />
        <TypingIndicator typingUsers={activeTypers} />
      </div>

      <MessageInput onSend={sendMessage} onTyping={sendTyping} />
    </div>
  )
}
