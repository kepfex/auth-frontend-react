import { useLogout } from "../features/auth/hooks/useAuth"
import { useAuthStore } from "../features/auth/store/auth.store"

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)
  const { logout } = useLogout()

  return (
    <div style={{ padding: 32 }}>
      <h1>Dashboard</h1>
      <p>Bienvenido, <strong>{user?.name}</strong></p>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  )
}