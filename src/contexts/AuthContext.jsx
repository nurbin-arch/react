import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [storedUser, setStoredUser] = useLocalStorage('rl_user', null)
  const [user, setUser] = useState(storedUser)

  useEffect(() => {
    setStoredUser(user)
  }, [user, setStoredUser])

  const login = async ({ email, password }) => {
    try {
      const result = await authAPI.login(email, password)
      if (result.ok) {
        setUser(result.user)
      }
      return result
    } catch (error) {
      console.error('Login error:', error)
      return { ok: false, error: 'Login failed. Please try again.' }
    }
  }

  const signup = async ({ email, password, role }) => {
    try {
      const result = await authAPI.signup({ email, password, role })
      if (result.ok) {
        setUser(result.user)
      }
      return result
    } catch (error) {
      console.error('Signup error:', error)
      return { ok: false, error: 'Signup failed. Please try again.' }
    }
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


