import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { apiRequest } from '../lib/api'
import type { AuthResponse, Credentials } from '../types'
import { AuthContext } from './auth-context'
import { createSession, readSession, saveSession } from './session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(readSession)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const requestVersion = useRef(0)

  function logout() {
    requestVersion.current += 1
    saveSession(null)
    setSession(null)
    setIsAuthenticating(false)
  }

  useEffect(() => {
    if (!session) return
    const expire = () => {
      if (session.expiresAt <= Date.now()) {
        requestVersion.current += 1
        saveSession(null)
        setSession(null)
        setIsAuthenticating(false)
      }
    }
    const timeout = window.setTimeout(
      expire,
      Math.max(0, session.expiresAt - Date.now()),
    )
    window.addEventListener('focus', expire)
    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('focus', expire)
    }
  }, [session])

  async function authenticate(path: string, credentials: Credentials) {
    const version = ++requestVersion.current
    setIsAuthenticating(true)
    try {
      const response = await apiRequest<AuthResponse>(path, {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
      const nextSession = createSession(response)
      if (version !== requestVersion.current)
        throw new Error('Authentication was cancelled.')
      saveSession(nextSession)
      setSession(nextSession)
      return nextSession.user
    } finally {
      if (version === requestVersion.current) setIsAuthenticating(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        token: session?.token ?? null,
        role: session?.user.role ?? null,
        isAuthenticated: session !== null,
        isAuthenticating,
        login: (credentials) => authenticate('/auth/signin', credentials),
        register: (credentials) => authenticate('/auth/signup', credentials),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
