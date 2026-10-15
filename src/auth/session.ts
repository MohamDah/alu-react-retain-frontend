import type { AuthResponse, AuthSession, User } from '../types'

const storageKey = 'retain.session'

function isUser(value: unknown): value is User {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'id' in value &&
    typeof value.id === 'string' &&
    'email' in value &&
    typeof value.email === 'string' &&
    'role' in value &&
    (value.role === 'USER' || value.role === 'ADMIN'),
  )
}

export function readSession(): AuthSession | null {
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem(storageKey) ?? 'null',
    )
    if (
      value &&
      typeof value === 'object' &&
      'user' in value &&
      isUser(value.user) &&
      'token' in value &&
      typeof value.token === 'string' &&
      value.token.length > 0 &&
      'expiresAt' in value &&
      typeof value.expiresAt === 'number' &&
      Number.isFinite(value.expiresAt) &&
      value.expiresAt > Date.now() &&
      value.expiresAt - Date.now() <= 3_600_000
    ) {
      return {
        user: value.user,
        token: value.token,
        expiresAt: value.expiresAt,
      }
    }
    sessionStorage.removeItem(storageKey)
  } catch {
    return null
  }
  return null
}

export function saveSession(session: AuthSession | null): void {
  try {
    if (session) sessionStorage.setItem(storageKey, JSON.stringify(session))
    else sessionStorage.removeItem(storageKey)
  } catch {
    return
  }
}

export function createSession(response: AuthResponse): AuthSession {
  if (
    !isUser(response.user) ||
    typeof response.accessToken !== 'string' ||
    !response.accessToken ||
    response.tokenType !== 'Bearer' ||
    !Number.isFinite(response.expiresIn) ||
    response.expiresIn <= 0 ||
    response.expiresIn > 3600
  ) {
    throw new Error('The server returned an invalid session.')
  }
  return {
    user: response.user,
    token: response.accessToken,
    expiresAt: Date.now() + response.expiresIn * 1000,
  }
}
