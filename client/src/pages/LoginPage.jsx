import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useChatContext } from '../context/ChatContext'
import './LoginPage.css'

const USERNAME_RE = /^[a-zA-Z0-9_]{2,20}$/
const API = import.meta.env.VITE_API_URL || '/api'

export default function LoginPage() {
  const { login, token } = useChatContext()
  const [isLogin, setIsLogin] = useState(true)
  const [input, setInput] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate('/app')
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    
    if (!USERNAME_RE.test(trimmed)) {
      setError('Username: 2–20 characters, letters/numbers/underscores only')
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return;
    }

    setLoading(true)
    setError('')

    const url = `${API}/auth/${isLogin ? 'login' : 'register'}`

    try {
      const { data } = await axios.post(url, { username: trimmed, password })
      login(data.username, data.token)
      navigate('/app')
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-blob blob-1" />
      <div className="login-blob blob-2" />

      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-icon">💬</span>
          <h1 className="login-title">ChatSphere</h1>
          <p className="login-subtitle">
            {isLogin ? 'Welcome back! Log in to your account.' : 'Create an account to join the conversation.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="username-input" className="login-label">Username</label>
            <input
              id="username-input"
              className="input"
              type="text"
              placeholder="e.g. alice_42"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError('') }}
              autoFocus
              autoComplete="username"
              maxLength={20}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password-input" className="login-label">Password</label>
            <input
              id="password-input"
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={!input.trim() || !password || loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In →' : 'Sign Up →'}
          </button>
        </form>

        <p className="login-hint">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            className="link-btn" 
            onClick={() => { setIsLogin(!isLogin); setError(''); setPassword(''); }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}
