import './OnlineUsersList.css'

const getInitial = (name) => (name ? name[0].toUpperCase() : '?')

const avatarColor = (name) => {
  const colors = ['#00d4b4', '#7c3aed', '#2563eb', '#db2777', '#d97706', '#059669']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function OnlineUsersList({ users, currentUsername }) {
  const sorted = [...users].sort((a, b) => {
    if (a === currentUsername) return -1
    if (b === currentUsername) return 1
    return a.localeCompare(b)
  })

  return (
    <div className="online-users">
      <div className="online-users-header">
        <span className="online-dot" />
        <span>Online — {users.length}</span>
      </div>
      <ul className="online-users-list">
        {sorted.map((user) => (
          <li key={user} className={`online-user-item ${user === currentUsername ? 'online-user-self' : ''}`}>
            <div
              className="online-user-avatar"
              style={{ background: avatarColor(user) }}
            >
              {getInitial(user)}
            </div>
            <div className="online-user-info">
              <span className="online-user-name">
                {user}
                {user === currentUsername && <span className="online-user-you"> (you)</span>}
              </span>
            </div>
            <span className="online-status-dot" />
          </li>
        ))}
      </ul>
    </div>
  )
}
