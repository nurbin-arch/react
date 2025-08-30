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
          <Link to={user ? (user.role === 'librarian' ? '/librarian' : '/student') : '/'}>
            <span style={{ fontSize: '24px', marginRight: 'var(--space-2)' }}>📚</span>
            BookNest
          </Link>
        </div>
        <div className="spacer" />
        <ul className="nav-links">
          {!user && (
            <>
              <li><NavLink to="/login" className="btn btn-secondary btn-small">Login</NavLink></li>
              <li><NavLink to="/signup/user" className="btn btn-secondary btn-small">Student Signup</NavLink></li>
              <li><NavLink to="/signup/admin" className="btn btn-secondary btn-small">Librarian Signup</NavLink></li>
            </>
          )}
          {user && (
            <>
              {user.role === 'librarian' ? <AdminNav /> : <UserNav />}
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <span style={{ 
                  fontSize: '16px',
                  color: user.role === 'librarian' ? 'var(--color-primary)' : 'var(--color-success)'
                }}>
                  {user.role === 'librarian' ? '📚' : '🎓'}
                </span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    fontWeight: '600',
                    color: 'var(--color-text)'
                  }}>
                    {user.name || user.email}
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-xs)', 
                    color: 'var(--color-muted)',
                    textTransform: 'capitalize'
                  }}>
                    {user.role}
                  </div>
                </div>
              </li>
              <li>
                <button 
                  className="btn btn-danger btn-small" 
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}
                >
                  <span>🚪</span>
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}


