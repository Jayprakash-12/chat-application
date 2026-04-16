import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

/**
 * Custom hook — creates and returns a Socket.io instance.
 * Auto-disconnects on component unmount and is React 18 StrictMode safe.
 */
export const useSocket = () => {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    
    // Create new socket instance
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [])

  return socket
}
