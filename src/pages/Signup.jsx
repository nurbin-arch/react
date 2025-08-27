import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', role: 'student' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    const res = await signup(form)
    setLoading(false)
    if (res.ok) {
      navigate(form.role === 'librarian' ? '/librarian' : '/student', { replace: true })
    }
  }

  return (
    <div className="auth">
      <h2>Signup</h2>
      <form onSubmit={submit}>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="librarian">Librarian</option>
        </select>
        <button disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
      </form>
      <p>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}


