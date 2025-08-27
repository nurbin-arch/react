import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AdminNav from './AdminNav'
import UserNav from './UserNav'

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <Link to={user ? (user.role === 'librarian' ? '/librarian' : '/student') : '/'}>📚 React Library</Link>
        </div>
        <div className="spacer" />
        <ul className="nav-links">
          {!user && (
            <>
              <li><NavLink to="/login">Login</NavLink></li>
              <li><NavLink to="/signup/user">Student signup</NavLink></li>
              <li><NavLink to="/signup/admin">Librarian signup</NavLink></li>
            </>
          )}
          {user && (
            <>
              {user.role === 'librarian' ? <AdminNav /> : <UserNav />}
              <li className="user-email" title={user.email}>{user.email}</li>
              <li>
                <button className="btn-small" onClick={handleLogout}>Logout</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}


