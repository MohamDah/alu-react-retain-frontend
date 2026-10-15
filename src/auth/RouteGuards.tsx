import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './auth-context'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

export function AdminRoute() {
  const { isAuthenticated, role } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return role === 'ADMIN' ? <Outlet /> : <Navigate to="/dashboard" replace />
}

export function PublicRoute() {
  const { isAuthenticated, role } = useAuth()
  return isAuthenticated
    ? <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />
    : <Outlet />
}

export function HomeRedirect() {
  const { isAuthenticated, role } = useAuth()
  return <Navigate to={!isAuthenticated ? '/login' : role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />
}