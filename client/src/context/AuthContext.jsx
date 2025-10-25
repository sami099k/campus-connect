import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, endpoints, setToken as setStoredToken, getToken as getStoredToken } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const t = getStoredToken()
    if (t) setToken(t)
    try {
      const saved = localStorage.getItem('user')
      if (saved) setUser(JSON.parse(saved))
    } catch {}
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    setError(null)
    const { data } = await api.post(endpoints.auth.login, { email, password })
    setStoredToken(data.token)
    setToken(data.token)
    setUser(data.user)
    try { localStorage.setItem('user', JSON.stringify(data.user)) } catch {}
    return data
  }

  const startRegister = async ({ email, name, password, confirmPassword }) => {
    setError(null)
    const { data } = await api.post(endpoints.auth.register, { email, name, password, confirmPassword })
    return data // contains email and academicDetails
  }

  const verifyOtp = async ({ email, name, password, otp }) => {
    setError(null)
    const { data } = await api.post(endpoints.auth.verify, { email, name, password, otp })
    setStoredToken(data.token)
    setToken(data.token)
    setUser(data.user)
    try { localStorage.setItem('user', JSON.stringify(data.user)) } catch {}
    return data
  }

  const logout = () => {
    setStoredToken(null)
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
  }

  const value = useMemo(() => ({ user, token, loading, error, login, startRegister, verifyOtp, logout, setUser }), [user, token, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
