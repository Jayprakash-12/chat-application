import { useEffect, useRef } from 'react'
import './MessageFeed.css'

const formatTime = (ts) => {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getInitial = (name) => (name ? name[0].toUpperCase() : '?')

const avatarColor = (name) => {
  const colors = ['#00d4b4', '#7c3aed', '#2563eb', '#db2777', '#d97706', '#059669']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function MessageFeed({ messages, username, selectedMessages = [], setSelectedMessages }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="feed-empty">
        <span className="feed-empty-icon">👋</span>
        <p>No messages yet — say hello!</p>
      </div>
    )
  }

  return (
    <div className="message-feed">
      {messages.map((msg, i) => {
        if (msg.type === 'system') {
          return (
            <div key={msg._id || i} className="system-message">
              <span>{msg.content}</span>
            </div>
          )
        }

        const isOwn = msg.username === username
        const color = avatarColor(msg.username)
        const isSelected = selectedMessages.includes(msg._id)

        const toggleSelection = (e) => {
          if (!isOwn) return;
          if (isSelected) {
            setSelectedMessages(prev => prev.filter(id => id !== msg._id))
          } else {
            setSelectedMessages(prev => [...prev, msg._id])
          }
        }

        return (
          <div
            key={msg._id || i}
            className={`message-row ${isOwn ? 'message-own' : 'message-other'} ${isSelected ? 'message-selected' : ''}`}
            style={{ animationDelay: `${i * 10}ms` }}
            onClick={(e) => {
               // Only trigger toggle if clicking the bubble area explicitly
               if (isOwn) { toggleSelection(e); }
            }}
          >
            {isOwn && (
              <div className="message-checkbox">
                {selectedMessages.length > 0 && (
                  <div className={`checkbox-circle ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </div>
                )}
              </div>
            )}
            {!isOwn && (
              <div className="avatar" style={{ background: color }}>
                {getInitial(msg.username)}
              </div>
            )}
            <div className="message-content">
              {!isOwn && <span className="message-username">{msg.username}</span>}
              <div className={`message-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
                {msg.content}
              </div>
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            </div>
            {isOwn && (
              <div className="avatar avatar-own" style={{ background: color, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); toggleSelection(e); }}>
                {getInitial(msg.username)}
              </div>
            )}
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
