import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import LibrarianDashboard from './pages/LibrarianDashboard.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import { useAuth } from './contexts/AuthContext.jsx'

function ProtectedRoute({ children, allow }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (allow && !allow.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/librarian"
        element={
          <ProtectedRoute allow={["librarian"]}>
            <LibrarianDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute allow={["student", "librarian"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
