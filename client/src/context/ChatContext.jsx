import { createContext, useContext, useState, useEffect } from 'react'

const ChatContext = createContext(null)

export const ChatProvider = ({ children }) => {
  const [username, setUsernameState] = useState(() => localStorage.getItem('cs_username') || '')
  const [token, setTokenState] = useState(() => localStorage.getItem('cs_token') || '')
  const [currentRoom, setCurrentRoom] = useState(null)

  const login = (user, jwt) => {
    setUsernameState(user)
    setTokenState(jwt)
    localStorage.setItem('cs_username', user)
    localStorage.setItem('cs_token', jwt)
  }

  const logout = () => {
    setUsernameState('')
    setTokenState('')
    localStorage.removeItem('cs_username')
    localStorage.removeItem('cs_token')
  }

  return (
    <ChatContext.Provider value={{ username, token, login, logout, currentRoom, setCurrentRoom }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChatContext = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider')
  return ctx
}
