import './TypingIndicator.css'

const buildText = (users) => {
  if (users.length === 0) return null
  if (users.length === 1) return `${users[0]} is typing`
  if (users.length === 2) return `${users[0]} and ${users[1]} are typing`
  return 'Several people are typing'
}

export default function TypingIndicator({ typingUsers }) {
  const text = buildText(typingUsers)
  if (!text) return <div className="typing-indicator-placeholder" />

  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span /><span /><span />
      </div>
      <span className="typing-text">{text}</span>
      <span className="typing-ellipsis">
        <span>.</span><span>.</span><span>.</span>
      </span>
    </div>
  )
}
