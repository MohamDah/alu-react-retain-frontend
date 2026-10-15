import { useEffect, useEffectEvent, useState } from 'react'
import { useAuth } from '../auth/auth-context'
import { ApiError, apiRequest, errorMessage } from '../lib/api'

interface Resource<Result> {
  token: string | null
  version: number
  data: Result | null
  error: string
  loading: boolean
}

export function useResource<Result>(load: (token: string, signal: AbortSignal) => Promise<Result>) {
  const { token, logout } = useAuth()
  const [version, setVersion] = useState(0)
  const [resource, setResource] = useState<Resource<Result>>({ token: null, version: -1, data: null, error: '', loading: true })
  const onUnauthorized = useEffectEvent(() => logout())

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    void load(token, controller.signal).then((data) => {
      if (!controller.signal.aborted) setResource({ token, version, data, error: '', loading: false })
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return
      if (error instanceof ApiError && error.status === 401) onUnauthorized()
      setResource({ token, version, data: null, error: errorMessage(error), loading: false })
    })
    return () => controller.abort()
  }, [load, token, version])

  const current = resource.token === token && resource.version === version ? resource : { data: null, error: '', loading: true }
  return { ...current, reload: () => setVersion((value) => value + 1) }
}

export function useApiMutation() {
  const { token, logout } = useAuth()
  return async function mutate<Result>(path: string, options: RequestInit): Promise<Result> {
    if (!token) throw new Error('Please sign in again.')
    try {
      return await apiRequest<Result>(path, options, token)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) logout()
      throw error
    }
  }
}