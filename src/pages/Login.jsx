import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    const res = await login(form)
    setLoading(false)
    if (res.ok) {
      navigate(form.email.includes('lib') ? '/librarian' : '/student', { replace: true })
    }
  }

  return (
    <div className="auth">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} />
        <button disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
      </form>
      <p>
        No account? <Link to="/signup">Signup</Link>
      </p>
    </div>
  )
}


