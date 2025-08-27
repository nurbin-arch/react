import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function SignupAdmin() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    const res = await signup({ ...form, role: 'librarian' })
    setLoading(false)
    if (res.ok) navigate('/librarian', { replace: true })
  }

  return (
    <div className="auth">
      <h2>Create Librarian Account</h2>
      <form onSubmit={submit}>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} />
        <button disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
      </form>
      <p>
        Creating a student account? <Link to="/signup/user">Create student account</Link>
      </p>
      <p>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}


