import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('') // Clear error when user types
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await login(form)
      if (res.ok) {
        const role = res.user?.role || (form.email.includes('lib') ? 'librarian' : 'student')
        navigate(role === 'librarian' ? '/librarian' : '/student', { replace: true })
      } else {
        setError(res.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="auth fade-in">
        <h2>Welcome Back</h2>
        
        {/* Test Credentials Info */}
        <div className="card" style={{ 
          marginBottom: 'var(--space-6)',
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-3)'
          }}>
            <span style={{ 
              fontSize: '20px',
              color: 'var(--color-primary)'
            }}>🔑</span>
            <strong style={{ color: 'var(--color-text)' }}>Test Credentials</strong>
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: '1.6' }}>
            <div><strong>Student:</strong> student1@library.com / student123</div>
            <div><strong>Librarian:</strong> librarian@library.com / librarian123</div>
            <div style={{ 
              marginTop: 'var(--space-2)', 
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-muted)'
            }}>
              See CREDENTIALS.md for more test accounts
            </div>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              name="email" 
              type="email"
              placeholder="Enter your email" 
              value={form.email} 
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              name="password" 
              type="password" 
              placeholder="Enter your password" 
              value={form.password} 
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          
          {error && (
            <div style={{ 
              color: 'var(--color-danger)', 
              fontSize: 'var(--font-size-sm)', 
              marginBottom: 'var(--space-4)',
              textAlign: 'center',
              padding: 'var(--space-3)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)'
            }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <span className="loading"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            Don't have an account? 
          </p>
          <div className="btn-group">
            <Link to="/signup/user" className="btn btn-secondary">
              Create Student Account
            </Link>
            <Link to="/signup/admin" className="btn btn-secondary">
              Create Librarian Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


