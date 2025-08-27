import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import SignupUser from './pages/SignupUser.jsx'
import SignupAdmin from './pages/SignupAdmin.jsx'
import LibrarianDashboard from './pages/LibrarianDashboard.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import { useAuth } from './contexts/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'

function ProtectedRoute({ children, allow }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (allow && !allow.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        {/* removed old combined signup route */}
        <Route path="/signup/user" element={<SignupUser />} />
        <Route path="/signup/admin" element={<SignupAdmin />} />
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
        <Route path="/" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
