import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ChatProvider, useChatContext } from './context/ChatContext'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './pages/DashboardLayout'
import ChatRoomPage from './pages/ChatRoomPage'

// Guard: redirect to login if no token
const ProtectedRoute = ({ children }) => {
  const { token } = useChatContext()
  return token ? children : <Navigate to="/" replace />
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
      <Route path="room/:roomId" element={<ChatRoomPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <AppRoutes />
      </ChatProvider>
    </BrowserRouter>
  )
}
