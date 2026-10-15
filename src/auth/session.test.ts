import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthResponse } from '../types'
import { createSession, readSession, saveSession } from './session'

const storage = new Map<string, string>()
const response: AuthResponse = {
  accessToken: 'test-token',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: { id: 'user', email: 'user@example.com', role: 'USER' },
}

beforeEach(() => {
  storage.clear()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-11T12:00:00Z'))
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('authentication sessions', () => {
  it('creates and restores a valid tab-scoped session', () => {
    const session = createSession(response)
    expect(session.expiresAt).toBe(Date.now() + 3_600_000)
    saveSession(session)
    expect(readSession()).toEqual(session)
  })

  it('clears storage on logout', () => {
    saveSession(createSession(response))
    saveSession(null)
    expect(readSession()).toBeNull()
    expect(storage.size).toBe(0)
  })

  it('does not restore an expired session', () => {
    saveSession(createSession(response))
    vi.advanceTimersByTime(3_600_000)
    expect(readSession()).toBeNull()
    expect(storage.size).toBe(0)
  })

  it('rejects malformed JSON, unknown roles and excessive lifetimes', () => {
    storage.set('retain.session', 'not-json')
    expect(readSession()).toBeNull()
    const session = createSession(response)
    storage.set(
      'retain.session',
      JSON.stringify({ ...session, user: { ...session.user, role: 'OWNER' } }),
    )
    expect(readSession()).toBeNull()
    storage.set(
      'retain.session',
      JSON.stringify({ ...session, expiresAt: Date.now() + 3_600_001 }),
    )
    expect(readSession()).toBeNull()
  })

  it('rejects invalid API tokens and durations', () => {
    expect(() => createSession({ ...response, accessToken: '' })).toThrow()
    expect(() => createSession({ ...response, expiresIn: 0 })).toThrow()
    expect(() => createSession({ ...response, expiresIn: 3601 })).toThrow()
  })

  it('handles unavailable browser storage without breaking authentication', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('Blocked storage')
      },
      setItem: () => {
        throw new Error('Blocked storage')
      },
      removeItem: () => {
        throw new Error('Blocked storage')
      },
    })
    expect(readSession()).toBeNull()
    expect(() => saveSession(createSession(response))).not.toThrow()
    expect(() => saveSession(null)).not.toThrow()
  })
})
