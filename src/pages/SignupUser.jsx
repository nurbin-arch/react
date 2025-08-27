import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function SignupUser() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    const res = await signup({ ...form, role: 'student' })
    setLoading(false)
    if (res.ok) navigate('/student', { replace: true })
  }

  return (
    <div className="auth">
      <h2>Create Student Account</h2>
      <form onSubmit={submit}>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} />
        <button disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
      </form>
      <p>
        Are you a librarian? <Link to="/signup/admin">Create librarian account</Link>
      </p>
      <p>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}


