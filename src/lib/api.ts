export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export async function apiRequest<Result>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<Result> {
  const headers = new Headers(options.headers)
  if (options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`/api${path}`, { ...options, headers })
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body: unknown = await response.json()
      if (body && typeof body === 'object' && 'message' in body) {
        if (typeof body.message === 'string') message = body.message
        else if (Array.isArray(body.message)) {
          message = body.message
            .filter((entry) => typeof entry === 'string')
            .join('. ')
        }
      }
    } catch {
      message =
        response.status >= 500
          ? 'The server is unavailable. Please try again.'
          : message
    }
    throw new ApiError(message, response.status)
  }
  if (response.status === 204) return undefined as Result
  return response.json() as Promise<Result>
}

export function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}
