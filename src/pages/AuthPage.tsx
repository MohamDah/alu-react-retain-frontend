import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, Wallet } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { errorMessage } from '../lib/api'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { login, register, isAuthenticating } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const isRegister = mode === 'register'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isAuthenticating) return
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const user = await (isRegister ? register : login)({
        email: String(form.get('email') ?? '').trim().toLowerCase(),
        password: String(form.get('password') ?? ''),
      })
      const state: unknown = location.state
      const from = state && typeof state === 'object' && 'from' in state ? state.from : null
      const allowedRoutes = ['/dashboard', '/expenses', '/budgets', ...(user.role === 'ADMIN' ? ['/admin/dashboard', '/admin/categories'] : [])]
      navigate(typeof from === 'string' && allowedRoutes.includes(from)
        ? from : user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard', { replace: true })
    } catch (failure) {
      setError(errorMessage(failure))
    }
  }

  return (
    <div className="min-h-svh">
      <header className="border-b border-line bg-white px-4 py-5 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Wallet className="size-6 text-brand" aria-hidden="true" />
          <span className="text-xl font-semibold">Retain</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-sm px-4 py-12 md:py-20 lg:py-24">
        <h1 className="text-2xl font-semibold">{isRegister ? 'Create an account' : 'Welcome back'}</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className="field" disabled={isAuthenticating} />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={8} maxLength={128} className="field pr-12" disabled={isAuthenticating} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} title={showPassword ? 'Hide password' : 'Show password'} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute right-1 top-1 flex size-9 items-center justify-center rounded text-muted hover:bg-canvas">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-budget-danger">{error}</p>}
          <button type="submit" disabled={isAuthenticating} className="button-primary w-full">
            {isAuthenticating ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>
        <p className="mt-6 text-sm text-muted">
          {isRegister ? 'Already have an account? ' : 'New to Retain? '}
          <Link to={isRegister ? '/login' : '/register'} className="font-medium text-brand underline underline-offset-4">{isRegister ? 'Sign in' : 'Create account'}</Link>
        </p>
      </main>
    </div>
  )
}