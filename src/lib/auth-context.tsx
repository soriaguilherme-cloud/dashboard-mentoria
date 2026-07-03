'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { mockProfiles } from '@/lib/mock-data'
import { Profile, UserRole } from '@/types/database'

const STORAGE_KEY = 'mentoria_auth'
const MOCK_PASSWORD = 'mentoria2025'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  initials: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  demoPassword: string
  login: (email: string, password: string) => Promise<{ error?: string }>
  loginAs: (profileId: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function toAuthUser(p: Profile): AuthUser {
  const parts = p.name.split(' ')
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : p.name.slice(0, 2).toUpperCase()
  return { id: p.id, name: p.name, email: p.email, role: p.role, initials }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) setUser(JSON.parse(stored))
      } catch {}
      setLoading(false)
    })
  }, [])

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    if (password !== MOCK_PASSWORD) return { error: 'Senha incorreta' }
    const profile = mockProfiles.find(p => p.email.toLowerCase() === email.toLowerCase())
    if (!profile) return { error: 'Email não encontrado' }
    const authUser = toAuthUser(profile)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    setUser(authUser)
    return {}
  }

  const loginAs = (profileId: string) => {
    const profile = mockProfiles.find(p => p.id === profileId)
    if (!profile) return
    const authUser = toAuthUser(profile)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    setUser(authUser)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, demoPassword: MOCK_PASSWORD, login, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
