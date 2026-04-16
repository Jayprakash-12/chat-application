import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useChatContext } from '../context/ChatContext'
import './DashboardLayout.css'

const API = import.meta.env.VITE_API_URL || '/api'

export default function DashboardLayout() {
  const { username, logout, setCurrentRoom } = useChatContext()
  const navigate = useNavigate()
  const location = useLocation()

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState(null)
  const [newRoom, setNewRoom] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [createError, setCreateError] = useState('')

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get(`${API}/rooms`)
      setRooms(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRooms() }, [])

  const joinRoom = (room) => {
    setCurrentRoom(room)
    navigate(`/app/room/${room._id}`)
  }

  const triggerDelete = (roomId, e) => {
    e.stopPropagation()
    setRoomToDelete(roomId)
  }

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    setDeleting(true)
    setCreateError('')
    try {
      await axios.delete(`${API}/rooms/${roomToDelete}`);
      setRooms(prev => prev.filter(r => r._id !== roomToDelete))
      
      // If active room deleted, navigate out
      if (location.pathname === `/app/room/${roomToDelete}`) {
        navigate('/app')
      }
      setRoomToDelete(null)
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to delete room')
    } finally {
      setDeleting(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newRoom.name.trim()) return
    setCreating(true)
    setCreateError('')
    try {
      await axios.post(`${API}/rooms`, newRoom)
      setNewRoom({ name: '', description: '' })
      setShowCreate(false)
      fetchRooms()
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create room')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="dashboard-layout">
      
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        
        {/* Sidebar Header */}
        <header className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-logo">💬</span>
            <h2>ChatSphere</h2>
          </div>
        </header>

        {/* Sidebar Actions */}
        <div className="sidebar-actions">
          <button className="btn btn-primary create-btn" onClick={() => setShowCreate(true)}>
            + New Room
          </button>
        </div>

        {/* Sidebar Room List */}
        <div className="sidebar-rooms">
          {loading ? (
            <div className="sidebar-message spinner-contain"><div className="spinner"></div></div>
          ) : rooms.length === 0 ? (
            <div className="sidebar-message">No rooms found.</div>
          ) : (
            <ul className="room-list">
              {rooms.map(room => {
                const isActive = location.pathname === `/app/room/${room._id}`;
                return (
                  <li 
                    key={room._id} 
                    className={`sidebar-room-item ${isActive ? 'active' : ''}`}
                    onClick={() => joinRoom(room)}
                  >
                    <div className="room-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                    <div className="room-info">
                      <div className="room-name">{room.name}</div>
                      {room.description && <div className="room-desc">{room.description}</div>}
                    </div>
                    
                    <button 
                      className="room-delete-tiny"
                      onClick={(e) => triggerDelete(room._id, e)}
                      title="Delete Room"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="user-dot"></span>
            <span className="user-name">{username}</span>
          </div>
          <button className="btn-icon logout-btn" title="Sign Out" onClick={() => { logout(); navigate('/') }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="dashboard-main">
        {location.pathname === '/app' ? (
          <div className="dashboard-placeholder">
            <span className="placeholder-icon">💬</span>
            <h2>Welcome perfectly!</h2>
            <p>Select a chat room on the left to start messaging.</p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {/* CREATE ROOM MODAL */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Create a Room</h3>
            <form onSubmit={handleCreate} className="modal-form">
              <input
                className="input"
                placeholder="Room name *"
                value={newRoom.name}
                onChange={(e) => setNewRoom(p => ({ ...p, name: e.target.value }))}
                maxLength={50}
                autoFocus
              />
              <input
                className="input"
                placeholder="Description (optional)"
                value={newRoom.description}
                onChange={(e) => setNewRoom(p => ({ ...p, description: e.target.value }))}
                maxLength={200}
              />
              {createError && <p className="modal-error">{createError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating || !newRoom.name.trim()}>
                  {creating ? 'Creating…' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {roomToDelete && (
        <div className="modal-overlay" onClick={() => setRoomToDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title" style={{ color: 'var(--danger)' }}>Delete Room?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '16px' }}>
              Permanently delete this room and all its messages? This cannot be undone.
            </p>
            {createError && <p className="modal-error">{createError}</p>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setRoomToDelete(null)} disabled={deleting}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={deleting} style={{ background: 'var(--danger)', color: 'white', border: 'none' }}>
                {deleting ? 'Deleting…' : 'Delete Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
