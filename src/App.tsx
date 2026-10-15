import { LogOut, Wallet } from 'lucide-react'
import { NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/auth-context'
import { AdminRoute, HomeRedirect, ProtectedRoute, PublicRoute } from './auth/RouteGuards'
import { AuthPage } from './pages/AuthPage'
import { UserDashboard } from './pages/UserDashboard'
import { resetFilters } from './store/FilterSlice'
import { useAppDispatch } from './store/hooks'

function AppLayout() {
  const { user, role, logout } = useAuth()
  const dispatch = useAppDispatch()
  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/expenses', label: 'Expenses' },
    { to: '/budgets', label: 'Budgets' },
    ...(role === 'ADMIN' ? [
      { to: '/admin/dashboard', label: 'Admin dashboard' },
      { to: '/admin/categories', label: 'Categories' },
    ] : []),
  ]
  return (
    <div className="min-h-svh">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Wallet className="size-6 shrink-0 text-brand" aria-hidden="true" />
            <span className="text-xl font-semibold text-ink">Retain</span>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden max-w-64 truncate text-sm text-muted md:block">{user?.email}</span>
            <button onClick={() => { dispatch(resetFilters()); logout() }} type="button" className="icon-button" title="Sign out" aria-label="Sign out"><LogOut className="size-5" /></button>
          </div>
        </div>
        <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl flex-wrap gap-x-5 gap-y-2 px-4 pb-3 md:px-6 lg:px-8">
          {links.map(({ to, label }) => <NavLink key={to} to={to} className={({ isActive }) => `border-b-2 pb-2 text-sm font-medium ${isActive ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`}>{label}</NavLink>)}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

function RoutePage({ title }: { title: string }) {
  return <h1 className="text-2xl font-semibold text-ink">{title}</h1>
}

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<AuthPage key="login" mode="login" />} />
        <Route path="/register" element={<AuthPage key="register" mode="register" />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/expenses" element={<RoutePage title="Expenses" />} />
          <Route path="/budgets" element={<RoutePage title="Budgets" />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<RoutePage title="Admin dashboard" />} />
            <Route path="/admin/categories" element={<RoutePage title="Categories" />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}

export default App
