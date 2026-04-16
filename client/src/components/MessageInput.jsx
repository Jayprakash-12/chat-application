import { useState, useRef, useCallback } from 'react'
import './MessageInput.css'

const TYPING_DEBOUNCE_MS = 2000

export default function MessageInput({ onSend, onTyping }) {
  const [value, setValue] = useState('')
  const typingTimer = useRef(null)
  const isTypingRef = useRef(false)

  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true
      onTyping(true)
    }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      isTypingRef.current = false
      onTyping(false)
    }, TYPING_DEBOUNCE_MS)
  }, [onTyping])

  const stopTyping = useCallback(() => {
    clearTimeout(typingTimer.current)
    if (isTypingRef.current) {
      isTypingRef.current = false
      onTyping(false)
    }
  }, [onTyping])

  const handleChange = (e) => {
    setValue(e.target.value)
    if (e.target.value.trim()) startTyping()
    else stopTyping()
  }

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
    stopTyping()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = value.trim().length > 0

  return (
    <div className="message-input-bar">
      <input
        id="message-input"
        className="message-input"
        type="text"
        placeholder="Type a message…"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        maxLength={2000}
      />
      <button
        id="send-btn"
        className={`send-btn ${canSend ? 'send-btn-active' : ''}`}
        onClick={handleSend}
        disabled={!canSend}
        title="Send message"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
