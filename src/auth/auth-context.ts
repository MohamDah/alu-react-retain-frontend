import { createContext, useContext } from 'react'
import type { Credentials, User, UserRole } from '../types'

export interface AuthContextValue {
  user: User | null
  token: string | null
  role: UserRole | null
  isAuthenticated: boolean
  isAuthenticating: boolean
  login: (credentials: Credentials) => Promise<User>
  register: (credentials: Credentials) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}