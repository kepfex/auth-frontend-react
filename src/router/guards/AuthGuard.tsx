import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/store/auth.store'

// Protege rutas privadas. Si no está autenticado, redirige al login.
export const AuthGuard = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}