import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function SignupAdmin() {
  const { signup } = useAuth()
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
      const res = await signup({ ...form, role: 'librarian' })
      if (res.ok) {
        navigate('/librarian', { replace: true })
      } else {
        setError(res.error || 'Signup failed')
      }
    } catch (err) {
      setError('Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="auth fade-in">
        <h2>Create Librarian Account</h2>
        
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 'var(--space-6)',
          padding: 'var(--space-4)',
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-md)'
        }}>
          <span style={{ fontSize: '24px', marginBottom: 'var(--space-2)', display: 'block' }}>📚</span>
          <p style={{ margin: 0, color: 'var(--color-text)' }}>
            Join our BookNest team as a librarian and help manage our collection!
          </p>
        </div>
        
        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              name="email" 
              type="email"
              placeholder="Enter your email address" 
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
              placeholder="Create a strong password" 
              value={form.password} 
              onChange={handleChange}
              className="form-control"
              minLength="6"
              required
            />
            <small style={{ 
              color: 'var(--color-muted)', 
              fontSize: 'var(--font-size-xs)',
              marginTop: 'var(--space-1)'
            }}>
              Password must be at least 6 characters long
            </small>
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
                Creating account...
              </>
            ) : (
              'Create Librarian Account'
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
            Creating a student account? 
          </p>
          <div className="btn-group">
            <Link to="/signup/user" className="btn btn-secondary">
              Create Student Account
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


