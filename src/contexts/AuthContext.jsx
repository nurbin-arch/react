import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [storedUser, setStoredUser] = useLocalStorage('rl_user', null)
  const [user, setUser] = useState(storedUser)

  useEffect(() => {
    setStoredUser(user)
  }, [user, setStoredUser])

  const login = async ({ email, password }) => {
    const role = email?.includes('lib') ? 'librarian' : 'student'
    setUser({ id: email, email, role })
    return { ok: true }
  }

  const signup = async ({ email, password, role }) => {
    setUser({ id: email, email, role: role || 'student' })
    return { ok: true }
  }

  const logout = () => setUser(null)

  const value = useMemo(() => ({ user, login, signup, logout }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


